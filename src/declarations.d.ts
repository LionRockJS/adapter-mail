declare module '@lionrockjs/central' {
  export const Central: any;
}

declare module '@lionrockjs/mod-mail' {
  export class MailAdapter {
    service: string;
    send(subject: string, text: string, sender: string, recipient: string, opts?: any): Promise<any>;
    readLog(email: string): Promise<void>;
  }
}

declare module 'nodemailer/lib/mail-composer/index.js' {
  export default class MailComposer {
    constructor(mail: any);
    compile(): any;
  }
}

declare module '@aws-sdk/client-ses' {
  export class SES {
    constructor(config: any);
    sendRawEmail(params: any): Promise<any>;
  }
}

declare module '@aws-sdk/credential-provider-ini' {
  export function fromIni(config: any): any;
}

declare module '@aws-sdk/client-dynamodb' {
  export class DynamoDBClient {
    constructor(config: any);
    send(command: any): Promise<any>;
  }
  export class ScanCommand {
    constructor(params: any);
  }
}
