export default {
  filename: import.meta.url,
  configs: ['mail']
}

import MailAdapterAWS from './classes/mail-adapter/AWS.mjs';
export {
  MailAdapterAWS
};
