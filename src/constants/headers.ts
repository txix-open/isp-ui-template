import { getConfigProperty } from '../utils/configUtils';

export const customHeaders = {
  'X-APPLICATION-TOKEN': getConfigProperty('APP_TOKEN', process.env.APP_TOKEN),
};
