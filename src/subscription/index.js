import { PubSub } from 'apollo-server';

import * as MESSAGE_EVENTS from './message';
import * as DIRECT_MESSAGE_EVENTS from './direct-message';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  DIRECT_MESSAGE: DIRECT_MESSAGE_EVENTS,
};

export default new PubSub();
