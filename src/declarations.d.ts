declare module '@lionrockjs/central' {
  export const Central: any;
  export const Model: any;
}

declare module '@lionrockjs/mod-mail' {
  export class MailAdapter {
    service: string;
    send(subject: string, text: string, sender: string, recipient: string, opts?: any): Promise<any>;
    readLog(email: string): Promise<void>;
  }
}

declare module 'twilio' {
  const twilio: any;
  export default twilio;
}
