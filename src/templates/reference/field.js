import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { Link } from 'gatsby';
import classnames from 'classnames';
import { useIntl } from 'react-intl';
import Img from 'gatsby-image';

import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import Section from '../../components/ReferenceItemSection';
import { CodeList, ExampleList } from '../../components/ReferenceItemList';

import { useTree, useHighlight, useWindowSize } from '../../hooks';
import { usePreparedItems, usePreparedExamples } from '../../hooks/reference';
import { referencePath, pathToName } from '../../utils/paths';

import css from '../../styles/templates/ref-template.module.css';
import grid from '../../styles/grid.module.css';

const FieldRefTemplate = ({ data, pageContext }) => {
  const { width } = useWindowSize();
  const [show, setShow] = useState(width > 960 ? true : false);
  const ref = useHighlight();
  const intl = useIntl();

  const items = usePreparedItems(data.items.nodes);
  const examples = usePreparedExamples(data.pdes.edges, data.images.edges);
  const tree = useTree(items);

  const entry = data?.json?.childJson;
  const { name, libraryName } = pageContext;
  const isProcessing = libraryName === 'processing';

  return (
    <Layout withSidebar>
      <Helmet>
        <title>
          {name} / {isProcessing ? 'Reference' : 'Libraries'}
        </title>
      </Helmet>
      <div className={classnames(css.root, grid.grid, grid.rightBleed)}>
        {isProcessing && (
          <Sidebar tree={tree} setShow={setShow} show={show} type="reference" />
        )}
        {entry ? (
          <div
            className={classnames(
              css.wrapper,
              { [css.collapsed]: !show },
              grid.nest
            )}
            ref={ref}>
            <div
              className={classnames(
                css.content,
                {
                  [css.collapsed]: !show,
                },
                grid.nest
              )}>
              <Section
                title={intl.formatMessage({ id: 'name' })}
                collapsed={!show}>
                <h3>{entry.name}</h3>
              </Section>
              <Section
                title={intl.formatMessage({ id: 'description' })}
                collapsed={!show}>
                <p
                  className={css.description}
                  dangerouslySetInnerHTML={{ __html: entry.description }}
                />
              </Section>
              {examples.length > 0 && (
                <Section
                  columns={false}
                  title={intl.formatMessage({ id: 'examples' })}
                  collapsed={!show}>
                  <ExampleList examples={examples} />
                </Section>
              )}
              {entry.related.length > 0 && (
                <Section
                  title={intl.formatMessage({ id: 'related' })}
                  collapsed={!show}>
                  <CodeList
                    nameIsPath
                    items={entry.related.map((rel) => ({
                      name: pathToName(rel),
                      anchor: referencePath(rel, libraryName),
                    }))}
                  />
                </Section>
              )}
            </div>
          </div>
        ) : (
          <div
            className={classnames(
              grid.grid,
              { [css.collapsed]: !show },
              { [css.expanded]: show }
            )}>
            <div className={classnames(grid.push1)}>
              {intl.formatMessage({ id: 'notTranslated' })}
              <Link to={referencePath(name, libraryName)}>
                {' '}
                {intl.formatMessage({ id: 'englishPage' })}
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FieldRefTemplate;

export const query = graphql`
  query($name: String!, $relDir: String!) {
    json: file(fields: { name: { eq: $name } }) {
      childJson {
        name
        description
        parameters {
          name
          description
          type
        }
        related
        returns
      }
    }
    images: allFile(
      filter: {
        relativeDirectory: { eq: $relDir }
        extension: { regex: "/(jpg)|(jpeg)|(png)|(gif)/" }
      }
    ) {
      edges {
        node {
          name
          internal {
            content
          }
          extension
          childImageSharp {
            fluid(maxWidth: 400) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    pdes: allFile(
      filter: {
        relativeDirectory: { eq: $relDir }
        extension: { regex: "/(pde)/" }
      }
    ) {
      edges {
        node {
          name
          internal {
            content
          }
          extension
        }
      }
    }
    items: allFile(
      filter: {
        fields: { lang: { eq: "en" }, lib: { eq: "processing" } }
        childJson: { type: { nin: ["method", "field"] } }
      }
    ) {
      nodes {
        name
        relativeDirectory
        childJson {
          category
          subcategory
          name
        }
      }
    }
  }
`;
