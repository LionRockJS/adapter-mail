import { Central } from '@lionrockjs/central';
import config from './config/mail.mjs';

await Central.initConfig(new Map([
  ['mail', config],
]));
