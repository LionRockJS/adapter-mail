import path from 'node:path';
import { Central } from '@lionrockjs/central';
import { MailAdapter } from '@lionrockjs/mod-mail';
import MailComposer from 'nodemailer/lib/mail-composer';
import { SES } from '@aws-sdk/client-ses';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export default class MailAdapterAWSSES extends MailAdapter {
  static credentials;
  static client;
  static ddb;
  /**
   *
   * @param opts
   * @param opts.host
   * @param opts.apiKey
   * @param opts.domain
   */
  constructor(opts) {
    super();
    this.service = 'AWS';

    MailAdapterAWSSES.credentials = MailAdapterAWSSES.credentials || fromIni({
      profile: Central.config.mail.aws.profile,
      filepath: path.normalize(Central.config.mail.aws.credentialsPath),
    });

    MailAdapterAWSSES.client = MailAdapterAWSSES.client || new SES({
      region: Central.config.mail.aws.region,
      credentials: MailAdapterAWSSES.credentials,
    });
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
   * @param {string} opts.html
   * @param {object[]} opts.attachments ['filename', 'data-path']
   * @param {string[]} opts.metadata ['user', '12345']
   * @returns {Promise<unknown>}
   */



  // eslint-disable-next-line class-methods-use-this
  async send(subject, text, sender, recipient, opts = {}) {

    const {
      cc = '',
      bcc = '',
      html = '',
      attachments = [],
      // metadata = [],
      project = Central.config.mail.aws.project,
      dynamoDB = Central.config.mail.aws.dynamoDB,
      configurationSetName = Central.config.mail.aws.configurationSetName,
    } = opts;

    const mail = {
      from: sender,
      to: recipient,
      subject: subject,
      text : text,
    };

    if (cc) mail.cc = cc;
    if (bcc) mail.bcc = bcc;
    if (html) mail.html = html
    if(attachments.length > 0) mail.attachments = attachments;

    const Data = await new Promise((resolve, reject) => {
      const mc = new MailComposer(mail).compile();
      mc.keepBcc = true;
      mc.build((err, msg) => {
        if(err)reject(err);
        resolve(msg);
      })
    });

    const result = await MailAdapterAWSSES.client.sendRawEmail({
      ConfigurationSetName: configurationSetName,
      Tags: [
        { Name: 'project', Value: project },
        { Name: 'dynamoDB', Value: dynamoDB },
      ],
      Destination: {
        ToAddresses: recipient.split(',').map(name => name.trim()),
      },
      Source: sender,
      RawMessage: { Data }
    });

    return {
      id: result.MessageId,
    };
  }

  async readLog(email) {
    MailAdapterAWSSES.ddb = MailAdapterAWSSES.ddb || new DynamoDBClient({
      region: Central.config.mail.aws.region,
      credentials: MailAdapterAWSSES.credentials,
    });

    // fetch from dynamoDB
    const results = await MailAdapterAWSSES.ddb.send(
      new ScanCommand({
        TableName: Central.config.mail.aws.dynamoDB,
        FilterExpression: '#c = :username and #p = :project',
        ProjectionExpression: 'mailMessageID, #c, event, #t',
        ExpressionAttributeNames: {
          '#c': 'to',
          '#t': 'timestamp',
          '#p': 'project',
        },
        ExpressionAttributeValues: {
          ':username': { S: email },
          ':project': { S: Central.config.mail.aws.project },
        },
      }),
    );

    const mailLogs = new Map([['service', this.service]]);

    results.Items.forEach(item => {
      const mailId = item.mailMessageID.S;
      if (!mailLogs.has(mailId))mailLogs.set(mailId, { open: 0, click: 0 });

      const counts = mailLogs.get(mailId);
      switch (item.event.S.toLowerCase()) {
        case 'open':
          counts.open += 1;
          break;
        case 'click':
          counts.click += 1;
          break;
        default:
      }
    });
  }
}