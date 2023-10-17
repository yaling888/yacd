import { query, QueryCtx } from './fetch';

export type VersionData = {
  version: string;
  plus_pro: boolean;
  premium?: boolean;
};

export async function fetchVersion(ctx: QueryCtx): Promise<VersionData> {
  const json = (await query(ctx)) || { version: '', plus_pro: false, premium: false };
  json['version'] = json['version'] || 'v1.0.0';
  json['plus_pro'] = json['version'].indexOf('PlusPro') > -1;
  json['premium'] = json['premium'] || false;
  return json;
}
