import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import cx from 'clsx';
import { formatDistance, Locale } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import React from 'react';
import { ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';

import prettyBytes from '../misc/pretty-bytes';
import s from './ConnectionTable.module.scss';
import { MutableConnRefCtx } from './conns/ConnCtx';

const fullColumns = [
  { header: 'Id', accessorKey: 'id' },
  { header: 'c_host', accessorKey: 'host' },
  { header: 'c_process', accessorKey: 'process' },
  {
    header: 'c_dl',
    accessorKey: 'download',
    cell: (info: any) => prettyBytes(info.getValue()),
  },
  {
    header: 'c_ul',
    accessorKey: 'upload',
    cell: (info: any) => prettyBytes(info.getValue()),
  },
  {
    header: 'c_dl_speed',
    accessorKey: 'downloadSpeedCurr',
    cell: (info: any) => prettyBytes(info.getValue()) + '/s',
  },
  {
    header: 'c_ul_speed',
    accessorKey: 'uploadSpeedCurr',
    cell: (info: any) => prettyBytes(info.getValue()) + '/s',
  },
  { header: 'c_chains', accessorKey: 'chains' },
  { header: 'c_rule', accessorKey: 'rule' },
  { header: 'c_rule_group', accessorKey: 'ruleGroup' },
  {
    header: 'c_time',
    accessorKey: 'start',
    cell: (info: any) => formatDistance(info.getValue(), 0, { locale: getLocale() }),
  },
  { header: 'c_source', accessorKey: 'source' },
  { header: 'c_destination_ip', accessorKey: 'destinationIP' },
  { header: 'c_type', accessorKey: 'type' },
];

const COLUMN_SORT = [{ id: 'id', desc: true }];

let locale = enUS;
let hasProcessPath = true;
let hasRuleGroup = true;
let columnsFiltered = fullColumns;

function getLocale(): Locale {
  return locale;
}

function Table({ data }: { data: any }) {
  const connCtx = React.useContext(MutableConnRefCtx);

  if (hasProcessPath !== connCtx.hasProcessPath || hasRuleGroup !== connCtx.hasRuleGroup) {
    if (!connCtx.hasProcessPath) {
      columnsFiltered = columnsFiltered.filter((item) => item.accessorKey !== 'process');
    }
    if (!connCtx.hasRuleGroup) {
      columnsFiltered = columnsFiltered.filter((item) => item.accessorKey !== 'ruleGroup');
    }
    if (hasProcessPath !== connCtx.hasProcessPath) {
      hasProcessPath = connCtx.hasProcessPath;
    }
    if (hasRuleGroup !== connCtx.hasRuleGroup) {
      hasRuleGroup = connCtx.hasRuleGroup;
    }
  }

  const [sorting, setSorting] = React.useState<SortingState>(COLUMN_SORT);
  const table = useReactTable({
    columns: columnsFiltered,
    data,
    state: {
      sorting,
      columnVisibility: { id: false },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { t, i18n } = useTranslation();
  locale = i18n.language && i18n.language.indexOf('zh') > -1 ? zhCN : enUS;

  return (
    <table className={s.table}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className={header.column.getCanSort() ? cx(s.th, s.pointer) : s.th}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className={s.thWrap}>
                      <span>
                        {t(flexRender(header.column.columnDef.header, header.getContext()))}
                      </span>
                      {header.column.getIsSorted() ? (
                        <span
                          className={
                            header.column.getIsSorted() === 'desc'
                              ? s.sortIconContainer
                              : cx(s.rotate180, s.sortIconContainer)
                          }
                        >
                          <ChevronDown size={16} />
                        </span>
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
