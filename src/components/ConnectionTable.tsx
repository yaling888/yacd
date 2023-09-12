import cx from 'clsx';
import { formatDistance, Locale } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale'
import React from 'react';
import { ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useSortBy, useTable } from 'react-table';

import prettyBytes from '../misc/pretty-bytes';
import s from './ConnectionTable.module.scss';
import { MutableConnRefCtx } from './conns/ConnCtx';

const sortDescFirst = true;

const fullColumns = [
  { accessor: 'id', show: false },
  { Header: 'c_host', accessor: 'host' },
  { Header: 'c_process', accessor: 'process' },
  { Header: 'c_dl', accessor: 'download', sortDescFirst },
  { Header: 'c_ul', accessor: 'upload', sortDescFirst },
  { Header: 'c_dl_speed', accessor: 'downloadSpeedCurr', sortDescFirst },
  { Header: 'c_ul_speed', accessor: 'uploadSpeedCurr', sortDescFirst },
  { Header: 'c_chains', accessor: 'chains' },
  { Header: 'c_rule', accessor: 'rule' },
  { Header: 'c_time', accessor: 'start', sortDescFirst },
  { Header: 'c_source', accessor: 'source' },
  { Header: 'c_destination_ip', accessor: 'destinationIP' },
  { Header: 'c_type', accessor: 'type' },
];

const columns = fullColumns;
const columnsWithoutProcess = fullColumns.filter((item) => item.accessor !== 'process');

function renderCell(cell: { column: { id: string }; value: number }, locale: Locale) {
  switch (cell.column.id) {
    case 'start':
      return formatDistance(cell.value, 0, { locale: locale });
    case 'download':
    case 'upload':
      return prettyBytes(cell.value);
    case 'downloadSpeedCurr':
    case 'uploadSpeedCurr':
      return prettyBytes(cell.value) + '/s';
    default:
      return cell.value;
  }
}

const sortById = { id: 'id', desc: true };
const tableState = {
  sortBy: [
    // maintain a more stable order
    sortById,
  ],
  hiddenColumns: ['id'],
};

// eslint-disable-next-line react/prop-types
function Table({ data }) {
  const connCtx = React.useContext(MutableConnRefCtx);
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: connCtx.hasProcessPath ? columns : columnsWithoutProcess,
      data,
      initialState: tableState,
      autoResetSortBy: false,
    },
    useSortBy
  );

  const { t, i18n } = useTranslation();
  const locale = i18n.language && i18n.language.indexOf('zh') > -1 ? zhCN : enUS;

  return (
    <div
      {...getTableProps()}
      style={{
        // @ts-ignore
        '--col-count': connCtx.hasProcessPath ? '12' : '11',
      }}
    >
      {headerGroups.map((headerGroup, i) => {
        return (
          <div key={i} {...headerGroup.getHeaderGroupProps()} className={s.tr}>
            {headerGroup.headers.map((column, idx) => (
              <div key={idx} {...column.getHeaderProps(column.getSortByToggleProps())} className={s.th}>
                <span>{t(column.render('Header'))}</span>
                <span className={s.sortIconContainer}>
                  {column.isSorted ? (
                    <span className={column.isSortedDesc ? '' : s.rotate180}>
                      <ChevronDown size={16} />
                    </span>
                  ) : null}
                </span>
              </div>
            ))}

            {rows.map((row, i) => {
              prepareRow(row);
              return row.cells.map((cell, j) => {
                return (
                  <div
                    key={j}
                    {...cell.getCellProps()}
                    className={cx(
                      s.td,
                      i % 2 === 0 ? s.odd : false,
                      connCtx.hasProcessPath
                        ? j >= 2 && j <= 5
                          ? s.du
                          : false
                        : j >= 1 && j <= 4
                        ? s.du
                        : false
                    )}
                  >
                    {renderCell(cell, locale)}
                  </div>
                );
              });
            })}
          </div>
        );
      })}
    </div>
  );
}

export default Table;
