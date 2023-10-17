import { useQuery } from '@tanstack/react-query';

import { fetchConfigs2 } from '$src/api/configs';
import { fetchVersion, VersionData } from '$src/api/version';
import { ENDPOINT } from '$src/misc/constants';
import { useApiConfig } from '$src/store/app';

export function useClashConfig() {
  const apiConfig = useApiConfig();
  return useQuery([ENDPOINT.config, apiConfig], fetchConfigs2);
}

export function useClashVersion(): VersionData {
  const apiConfig = useApiConfig();
  const { data: version } = useQuery([ENDPOINT.version, apiConfig], fetchVersion);
  return version;
}
