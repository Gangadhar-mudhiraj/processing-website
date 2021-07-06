import React, { memo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { LocalizedLink as Link } from 'gatsby-theme-i18n';
import classnames from 'classnames';
import { useIntl } from 'react-intl';
import Img from 'gatsby-image';
import p5 from 'p5';

import Layout from '../../components/Layout';
import Content from '../../components/ContentWithSidebar';
import { SidebarTree } from '../../components/Sidebar';
import Tabs from '../../components/Tabs';
import { ExampleItem } from '../../components/examples/ExamplesList';
import Breadcrumbs from '../../components/Breadcrumbs';

import { referencePath } from '../../utils/paths';
import { useTree, useSidebar } from '../../hooks';
import {
  usePreparedExample,
  usePreparedExamples,
  useRelatedExamples,
  useOrderedPdes,
  useTrail
} from '../../hooks/examples';

import css from '../../styles/templates/examples/example.module.css';
import grid from '../../styles/grid.module.css';

// This is to make sure that p5.Vector and other namespaced classes
// work in the live sketch examples.
if (typeof window !== 'undefined') {
  window.p5 = p5;
}

const ExampleTemplate = ({ data, pageContext }) => {
  const [showSidebar, setShowSidebar] = useSidebar('examples');
  const intl = useIntl();

  const { name, related } = pageContext;
  const { image, allExamples, relatedImages, liveSketch } = data;

  const example = usePreparedExample(data.example);
  const pdes = useOrderedPdes(name, data.pdes.nodes);
  const examples = usePreparedExamples(allExamples.nodes, relatedImages.nodes);
  const tree = useTree(examples);
  const relatedExamples = useRelatedExamples(examples, related);

  const trail = useTrail(example);

  // Run live sketch
  useEffect(() => {
    if (liveSketch && example) {
      let p5Instance;
      const tryToRunSketch = () => {
        if (window.runLiveSketch) {
          console.log('Live sketch: running');
          p5Instance = new p5(window.runLiveSketch, 'example-cover');
        } else {
          console.log('Live sketch: Not ready');
          setTimeout(tryToRunSketch, 50);
        }
      };
      setTimeout(tryToRunSketch, 500);
      return () => {
        if (p5Instance) {
          console.log('Live sketch: Removing');
          p5Instance.remove();
        }
      };
    }
  }, [liveSketch, example]);

  return (
    <Layout withSidebar withBreadcrumbs>
      <Helmet>
        {example && <title>{example.title}</title>}
        {liveSketch && <script>{`${liveSketch.childRawCode.content}`}</script>}
      </Helmet>
      <div className={grid.grid}>
        <SidebarTree
          title={intl.formatMessage({ id: 'examples' })}
          tree={tree}
          setShow={setShowSidebar}
          show={showSidebar}
          useSerif
        />
        {example ? (
          <Content sidebarOpen={showSidebar}>
            <Breadcrumbs trail={trail} />
            <h1>{example.title}</h1>
            {example.author && (
              <h3>
                {intl.formatMessage({ id: 'by' })} {example.author}
              </h3>
            )}
            <div className={grid.grid}>
              <div className={classnames(grid.col, css.description)}>
                <p
                  dangerouslySetInnerHTML={{
                    __html: example.description
                  }}></p>
              </div>
              {example.featured.length > 0 && (
                <FeaturedFunctions
                  featured={example.featured}
                  heading={intl.formatMessage({ id: 'featured' })}
                />
              )}
            </div>
            <div className={css.cover} id="example-cover">
              {!liveSketch && image && (
                <Img fluid={image.childImageSharp.fluid} />
              )}
            </div>
            <Tabs pdes={pdes} className={css.tabs} />
            <RelatedExamples
              examples={relatedExamples}
              heading={intl.formatMessage({ id: 'relatedExamples' })}
            />
            <p className={classnames(css.note)}>
              {intl.formatMessage({ id: 'exampleInfo' })}
              <a
                href={
                  'https://github.com/processing/processing-website/issues?state=open'
                }>
                {intl.formatMessage({ id: 'letUsKnow' })}
              </a>
              .
            </p>
          </Content>
        ) : (
          <Content sidebarOpen={showSidebar}>
            {intl.formatMessage({ id: 'notTranslated' })}
            <Link to={pageContext.slug}>
              {' '}
              {intl.formatMessage({ id: 'englishPage' })}
            </Link>
          </Content>
        )}
      </div>
    </Layout>
  );
};

const FeaturedFunctions = memo(({ heading, featured }) => {
  return (
    <div className={classnames(grid.col, css.featured)}>
      <h3>{heading}</h3>
      <ul>
        {featured.map((feature, key) => (
          <li key={`feature-${key}`}>
            <Link to={referencePath(feature)}>
              {feature.replace(/_$/, '()').replace(/_/g, ' ')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

const RelatedExamples = memo(({ heading, examples }) => {
  return (
    <div>
      <h3>{heading}</h3>
      <ul className={grid.grid}>
        {examples.slice(0, 6).map((example, key) => (
          <ExampleItem
            node={example}
            key={`example-${example.name}`}
            variant="related"
          />
        ))}
      </ul>
    </div>
  );
});

export default ExampleTemplate;

export const query = graphql`
  query(
    $name: String!
    $relDir: String!
    $locale: String!
    $related: [String!]!
  ) {
    example: file(
      fields: { name: { eq: $name }, lang: { eq: $locale } }
      sourceInstanceName: { eq: "examples" }
    ) {
      relativeDirectory
      childJson {
        name
        title
        author
        description
        featured
      }
    }
    pdes: allFile(
      filter: {
        sourceInstanceName: { eq: "examples" }
        relativeDirectory: { eq: $relDir }
        extension: { regex: "/(pde)/" }
      }
    ) {
      nodes {
        name
        internal {
          content
        }
      }
    }
    image: file(
      relativeDirectory: { eq: $relDir }
      extension: { regex: "/(png)/" }
    ) {
      name
      relativeDirectory
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    liveSketch: file(
      relativeDirectory: { eq: $relDir }
      name: { eq: "liveSketch" }
      extension: { regex: "/(js$)/" }
    ) {
      name
      childRawCode {
        content
      }
    }
    allExamples: allFile(
      filter: {
        sourceInstanceName: { eq: "examples" }
        fields: { lang: { eq: "en" } }
        extension: { eq: "json" }
        relativeDirectory: { regex: "/^((?!data).)*$/" }
      }
      sort: { order: ASC, fields: relativeDirectory }
    ) {
      nodes {
        name
        relativeDirectory
        relativePath
        childJson {
          name
          title
        }
      }
    }
    relatedImages: allFile(
      filter: {
        name: { in: $related }
        sourceInstanceName: { eq: "examples" }
        extension: { regex: "/(jpg)|(jpeg)|(png)|(gif)/" }
        relativeDirectory: { regex: "/^((?!data).)*$/" }
      }
    ) {
      nodes {
        name
        relativeDirectory
        childImageSharp {
          fluid(maxWidth: 200) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`;
