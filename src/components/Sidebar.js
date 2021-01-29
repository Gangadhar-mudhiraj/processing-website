import React, { Fragment, useContext, useState, useMemo } from 'react';
import classnames from 'classnames';
import { useIntl } from 'react-intl';

import FilterBar from '../components/FilterBar';
import SidebarList from '../components/SidebarList';

import { LayoutContext } from '../components/Layout';

import {
  filterItems,
  organizeExampleItems,
  organizeReferenceItems,
} from '../utils/data';

import css from './Sidebar.module.css';

const Sidebar = (props) => {
  const { items, show, type = 'reference', onChange } = props;
  const [searchTerm, setSearchTerm] = useState('');
  const layout = useContext(LayoutContext);
  const intl = useIntl();

  const filteredItems = useMemo(() => filterItems(items.nodes, searchTerm), [
    searchTerm,
    items.nodes,
  ]);

  const tree = useMemo(
    () =>
      type === 'reference'
        ? organizeReferenceItems(filteredItems)
        : organizeExampleItems(filteredItems),
    [filteredItems, type]
  );

  return (
    <div
      className={classnames(
        css.root,
        { [css.show]: show },
        { [css.headerScrolled]: layout.headerScrolled }
      )}
      style={{}}>
      <div
        className={css.toggleButton}
        onClick={(e) => onChange(!show)}
        onKeyDown={(e) => onChange(!show)}
        role={'button'}
        tabIndex={'0'}>
        {show ? '×' : '+'}
      </div>
      {show && (
        <Fragment>
          <h2>
            {type === 'reference'
              ? intl.formatMessage({ id: 'reference' })
              : intl.formatMessage({ id: 'examples' })}
          </h2>
          <FilterBar
            placeholder={'Filter'}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => setSearchTerm('')}
            searchTerm={searchTerm}
            className={css.filterBar}
          />
          <div className={css.listWrapper}>
            <SidebarList data={tree} type={type} />
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default Sidebar;
