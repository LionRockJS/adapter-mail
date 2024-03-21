import url from "node:url";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

export default {
  aws: {
    credentialsPath: `${__dirname}/credentials`,
    profile: 'default',
    region: 'ap-southeast-1',
    configurationSetName: 'default',
    project: 'LionRockJS',
    dynamoDB: 'SES_DEFAULT',
  },
};
