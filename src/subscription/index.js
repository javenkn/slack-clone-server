import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';

import * as MESSAGE_EVENTS from './message';
import * as DIRECT_MESSAGE_EVENTS from './direct-message';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  DIRECT_MESSAGE: DIRECT_MESSAGE_EVENTS,
};

/* Production usage */
const options = {
  host: '127.0.0.1',
  port: 6379,
  retry_strategy: options =>
    // reconnect after
    Math.max(options.attempt * 100, 3000),
};

export default new RedisPubSub({
  ...options,
});
