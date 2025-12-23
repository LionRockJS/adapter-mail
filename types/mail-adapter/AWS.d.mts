import { MailAdapter } from '@lionrockjs/mod-mail';
import { SES } from '@aws-sdk/client-ses';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
export default class MailAdapterAWSSES extends MailAdapter {
    static credentials: any;
    static client: SES;
    static ddb: DynamoDBClient;
    service: string;
    /**
     *
     * @param opts
     * @param opts.host
     * @param opts.apiKey
     * @param opts.domain
     */
    constructor(opts?: any);
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
    send(subject: string, text: string, sender: string, recipient: string, opts?: any): Promise<{
        id: any;
    }>;
    readLog(email: string): Promise<void>;
}
