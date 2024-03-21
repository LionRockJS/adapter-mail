import url from "node:url";
const dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

export default {
  dirname
}

import MailAdapterAWS from './classes/mail-adapter/AWS.mjs';
export {
  MailAdapterAWS
};
