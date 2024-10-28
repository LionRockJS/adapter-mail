import {Central} from '@lionrockjs/central';
export default {
  aws: {
    credentialsPath: `${Central.APP_PATH}/config/credentials`,
    profile: 'default',
    region: 'ap-southeast-1',
    configurationSetName: 'default',
    project: 'LionRockJS',
    dynamoDB: 'SES_DEFAULT',
  },
};
