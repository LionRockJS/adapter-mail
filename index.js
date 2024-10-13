export default {
  filename: import.meta.url,
  configs: ['mail']
}

import MailAdapterTwilio from './classes/mail-adapter/Twilio.mjs';
export {
  MailAdapterTwilio
};
