import path from 'node:path';
import { Central } from '@lionrockjs/central';
import { MailAdapter } from '@lionrockjs/mod-mail';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { SES } from '@aws-sdk/client-ses';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export default class MailAdapterAWSSES extends MailAdapter {
  static credentials: any;
  static client: SES;
  static ddb: DynamoDBClient;
  declare service: string;

  /**
   *
   * @param opts
   * @param opts.host
   * @param opts.apiKey
   * @param opts.domain
   */
  constructor(opts: any = {}) {
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
   * @param {string} opts.reply_to
   * @returns {Promise<unknown>}
   */



  // eslint-disable-next-line class-methods-use-this
  async send(subject: string, text: string, sender: string, recipient: string, opts: any = {}) {

    const {
      cc = '',
      bcc = '',
      html = '',
      attachments = [],
      // metadata = [],
      project = Central.config.mail.aws.project,
      dynamoDB = Central.config.mail.aws.dynamoDB,
      configurationSetName = Central.config.mail.aws.configurationSetName,
      reply_to=''
    } = opts;

    const mail: any = {
      from: sender,
      to: recipient,
      subject: subject,
      text : text,
    };

    if (cc) mail.cc = cc;
    if (bcc) mail.bcc = bcc;
    if (html) mail.html = html
    if(attachments.length > 0) mail.attachments = attachments;
    if(reply_to)mail.replyTo = reply_to;

    const Data = await new Promise<Buffer | string>((resolve, reject) => {
      const mc = new MailComposer(mail).compile();
      mc.keepBcc = true;
      mc.build((err: any, msg: any) => {
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
      RawMessage: { Data: Data as any }
    });

    return {
      id: result.MessageId,
    };
  }

  async readLog(email: string) {
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

    const mailLogs = new Map<string, any>([['service', this.service]]);

    results.Items?.forEach(item => {
      const mailId = item.mailMessageID.S;
      if (!mailId) return;
      if (!mailLogs.has(mailId))mailLogs.set(mailId, { open: 0, click: 0 });

      const counts = mailLogs.get(mailId);
      if (!item.event.S) return;
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
