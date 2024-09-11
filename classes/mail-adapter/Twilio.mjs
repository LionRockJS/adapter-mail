import {Central, Model} from '@lionrockjs/central';
import {MailAdapter} from '@lionrockjs/mod-mail';
import Twilio from 'twilio';

export default class MailAdapterTwilio extends MailAdapter {
  /**
   *
   * @param opts
   * @param opts.host
   * @param opts.apiKey
   * @param opts.domain
   */
  constructor(opts) {
    super();
    this.service = 'Twilio';
    this.client = Twilio(
      Central.adapter.process().env.TWILIO_SID,
      Central.adapter.process().env.TWILIO_TOKEN
    );
  }
  /**
   *
   * @param {string} subject
   * @param {string} text
   * @param {string} sender
   * @param {string} recipient
   * @param opts
   * @param {string} opts.cc
   * @param {string} opts.bcc
   * @returns {Promise<unknown>}
   */

  // eslint-disable-next-line class-methods-use-this
  async send(subject, text, sender, recipient, opts = {}) {
    const {
      bcc = '',
    } = opts;

    const recipients = [
      ...bcc.split(',').map(name => name.trim()),
      ...recipient.split(',').map(name => name.trim()),
    ].filter(it => !!it);

    const results = await Promise.all(
      recipients.map(
        async it => {
          const MessageId = Model.defaultAdapter.defaultID();
          const options = { to: it, from: sender, body: subject + text };
          if (Central.config.mail.twilio.statusCallbackUrl) {
            options.statusCallback = `${Central.config.mail.twilio.statusCallbackUrl}?message_id=${MessageId}`;
          }
          const result = await this.client.messages.create(options);
          return { MessageId, result };
        },
      ),
    );

    return {
      id: results.pop().MessageId,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async readLog(email) {
    Central.log('TODO: implement Twilio read log');
  }
}