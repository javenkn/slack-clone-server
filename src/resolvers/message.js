import { withFilter } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from '../helpers/permissions';
import pubsub, { EVENTS } from '../subscription';

export default {
  Query: {
    messages: combineResolvers(
      isAuthenticated,
      (parent, { channelId }, { models, user }) =>
        models.Message.findAll(
          { order: [['createdAt', 'ASC']], where: { channelId } },
          { raw: true },
        ),
    ),
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const message = await models.Message.create({
            ...args,
            userId: user.id,
          });
          pubsub.publish(EVENTS.MESSAGE.CREATED, {
            channelId: args.channelId,
            messageCreated: { ...message.dataValues },
          });
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
    ),
  },
  Subscription: {
    messageCreated: {
      subscribe: withFilter(
        combineResolvers(
          isAuthenticated,
          async (parent, { channelId }, { models, user }) => {
            // check if part of team
            const channel = await models.Channel.findOne({
              where: { id: channelId },
            });
            const member = await models.Member.findOne({
              where: { teamId: channel.teamId, userId: user.id },
            });
            if (!member) {
              throw new Error('You have to be a member to subscribe.');
            }
            return pubsub.asyncIterator(EVENTS.MESSAGE.CREATED);
          },
        ),
        (payload, { channelId }) => payload.channelId === channelId,
      ),
    },
  },
  Message: {
    user: ({ userId }, args, { models }) =>
      models.User.findOne({ where: { id: userId } }),
  },
};
