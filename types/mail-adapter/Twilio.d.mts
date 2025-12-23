import { MailAdapter } from '@lionrockjs/mod-mail';
export default class MailAdapterTwilio extends MailAdapter {
    client: any;
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
     * @returns {Promise<unknown>}
     */
    send(subject: string, text: string, sender: string, recipient: string, opts?: any): Promise<{
        id: any;
    }>;
    readLog(email: string): Promise<void>;
}
