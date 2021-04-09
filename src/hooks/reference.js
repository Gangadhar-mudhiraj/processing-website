import { useMemo } from 'react';
import { titleCase } from '../utils';
import { referencePath } from '../utils/paths';

/**
  Hook to turn the reference items in an object that can be used in useTree
  @param {Array} items GraphQL reference items
**/
export const usePreparedItems = (items, libraryName) => {
  return useMemo(() => {
    // This makes up for some weirdness in lowercase/uppercase category and subcategory
    // names and removes underscores and adds title cases. Some of these should be fixed
    // in the JavaDoc comments instead.
    return items.map((item) =>
      Object.assign({}, item.childJson, {
        slug: item.name,
        path: referencePath(item.name, libraryName),
        category: titleCase(item.childJson.category),
        subcategory: titleCase(item.childJson.subcategory),
        search: `${item.childJson.name} ${item.childJson.brief ?? ''}`,
      })
    );
  }, [items, libraryName]);
};

/**
  Hook to prepare every reference example and find an image for it
  @param {Array} examples GraphQL reference examples
  @param {Array} images GraphQL image nodes
**/
export const usePreparedExamples = (pdes, images) => {
  return useMemo(() => {
    if (!pdes || pdes.length === 0 || !images || images.length === 0) {
      return [];
    }
    const prepared = [];
    for (let i = 0; i < pdes.length; i++) {
      const example = {
        code: pdes[i].node.internal.content,
      };

      for (let j = 0; j < images.length; j++) {
        if (images[j].node.name === pdes[i].node.name) {
          example.image = images[j].node;
        }
      }

      prepared.push(example);
    }
    return prepared;
  }, [pdes, images]);
};
