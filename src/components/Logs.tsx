import cx from 'clsx';
import { useAtom } from 'jotai';
import * as React from 'react';
import { Pause, Play } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { areEqual, FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { fetchLogs, stop as stopLogs } from 'src/api/logs';
import { ContentHeader } from 'src/components/ContentHeader';
import LogSearch from 'src/components/LogSearch';
import Select from 'src/components/shared/Select';
import { connect } from 'src/components/StateProvider';
import SvgYacd from 'src/components/SvgYacd';
import useRemainingViewPortHeight from 'src/hooks/useRemainingViewPortHeight';
import { logLevelAtom, logStreamingPausedAtom, useApiConfig } from 'src/store/app';
import { appendLog, getLogsForDisplay } from 'src/store/logs';
import { DispatchFn, Log, State } from 'src/store/types';

import s from './Logs.module.scss';
import { Fab, position as fabPosition } from './shared/Fab';

const logLeveOptions = [
  ['debug', 'Debug'],
  ['info', 'Info'],
  ['warning', 'Warning'],
  ['error', 'Error'],
];

const { useCallback, memo, useEffect, useRef } = React;

const paddingBottom = 30;
const colors = {
  debug: '#28792c',
  info: 'var(--bg-log-info-tag)',
  warning: '#b99105',
  error: '#c11c1c',
};

function LogLine({ time, even, payload, type }: Log) {
  const className = cx({ even }, 'log');
  return (
    <div className={className}>
      <div className={s.logMeta}>
        <div className={s.logTime}>{time}</div>
        <div className={s.logType} style={{ backgroundColor: colors[type] }}>
          {type}
        </div>
        <div className={s.logText}>{payload}</div>
      </div>
    </div>
  );
}

function itemKey(index: number, data: Log[]) {
  const item = data[index];
  return item.id;
}

const Row = memo(({ index, style, data }: ListChildComponentProps<Log[]>) => {
  const r = data[index];
  return (
    <div style={style}>
      <LogLine {...r} />
    </div>
  );
}, areEqual);

Row.displayName = 'MemoRow';

function Logs({ dispatch, logs }: { dispatch: DispatchFn; logs: Log[] }) {
  const refFetch = useRef(0);
  const [logLevel, setLogLevel] = useAtom(logLevelAtom);
  const [logStreamingPaused, setLogStreamingPaused] = useAtom(logStreamingPausedAtom);
  const apiConfig = useApiConfig();
  const toggleIsRefreshPaused = useCallback(() => {
    if (refFetch.current === 1) {
      refFetch.current = 0;
      stopLogs();
    }
    setLogStreamingPaused(!logStreamingPaused);
  }, [logStreamingPaused, setLogStreamingPaused]);

  const onChangeLogLevel = useCallback(
    (e) => {
      const level = e.target.value;
      if (logLevel === level) return;
      if (refFetch.current === 1) {
        refFetch.current = 0;
        stopLogs();
      }
      setLogLevel(level);
    },
    [logLevel, setLogLevel],
  );

  const appendLogInternal = useCallback((log: Log) => dispatch(appendLog(log)), [dispatch]);
  useEffect(() => {
    return () => {
      if (refFetch.current === 1) {
        refFetch.current = 0;
        stopLogs();
      }
    };
  }, []);

  useEffect(() => {
    if (logStreamingPaused) return;
    if (refFetch.current === 0) {
      refFetch.current = 1;
    }
    fetchLogs({ ...apiConfig, logLevel }, appendLogInternal);
  }, [logStreamingPaused, apiConfig, logLevel, appendLogInternal]);

  const [refLogsContainer, containerHeight] = useRemainingViewPortHeight();
  const { t } = useTranslation();

  return (
    <div>
      <ContentHeader title={t('Logs')} />
      <div className={s.search}>
        <div className={s.logLevel}>
          <Select options={logLeveOptions} selected={logLevel} onChange={onChangeLogLevel} />
        </div>
        <div className={s.searchBox}>
          <LogSearch />
        </div>
      </div>
      <div ref={refLogsContainer} style={{ paddingBottom }}>
        {logs.length === 0 ? (
          <div className={s.logPlaceholder} style={{ height: containerHeight - paddingBottom }}>
            <div className={s.logPlaceholderIcon}>
              <SvgYacd width={200} height={200} />
            </div>
            <div>{t('no_logs')}</div>
            <Fab
              icon={logStreamingPaused ? <Play size={16} /> : <Pause size={16} />}
              mainButtonStyles={logStreamingPaused ? { background: '#e74c3c' } : {}}
              style={fabPosition}
              text={logStreamingPaused ? t('Resume Refresh') : t('Pause Refresh')}
              onClick={toggleIsRefreshPaused}
            ></Fab>
          </div>
        ) : (
          <div className={s.logsWrapper}>
            <List
              height={containerHeight - paddingBottom}
              width="100%"
              itemCount={logs.length}
              itemSize={80}
              itemData={logs}
              itemKey={itemKey}
            >
              {Row}
            </List>

            <Fab
              icon={logStreamingPaused ? <Play size={16} /> : <Pause size={16} />}
              mainButtonStyles={logStreamingPaused ? { background: '#e74c3c' } : {}}
              style={fabPosition}
              text={logStreamingPaused ? t('Resume Refresh') : t('Pause Refresh')}
              onClick={toggleIsRefreshPaused}
            ></Fab>
          </div>
        )}
      </div>
    </div>
  );
}

const mapState = (s: State) => ({
  logs: getLogsForDisplay(s),
});

export default connect(mapState)(Logs);
