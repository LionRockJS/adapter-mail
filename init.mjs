import { Central } from '@lionrockjs/central';
import config from './config/mail.mjs';

Central.initConfig(new Map([
  ['mail', config],
]));
