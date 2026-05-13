import MailAdapterTwilio from './mail-adapter/Twilio.mjs';
import ConfigMail from './config/mail.mjs';

export default {
  configs: {
    mail: ConfigMail,
  }
}

export {
  MailAdapterTwilio
};
