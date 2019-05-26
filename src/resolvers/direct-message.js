import { withFilter } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import Sequelize from 'sequelize';
const op = Sequelize.Op;

import { isAuthenticated } from '../helpers/permissions';
// import pubsub, { EVENTS } from '../subscription';

export default {
  Query: {
    directMessages: combineResolvers(
      isAuthenticated,
      async (parent, { teamId, otherUserId }, { models, user }) =>
        models.DirectMessage.findAll(
          {
            order: [['createdAt', 'ASC']],
            where: {
              teamId,
              [op.or]: [
                {
                  [op.and]: [
                    { receiverId: otherUserId },
                    { senderId: user.id },
                  ],
                },
                {
                  [op.and]: [
                    { receiverId: user.id },
                    { senderId: otherUserId },
                  ],
                },
              ],
            },
          },
          { raw: true },
        ),
    ),
  },
  Mutation: {
    createDirectMessage: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const message = await models.DirectMessage.create({
            ...args,
            senderId: user.id,
          });
          // pubsub.publish(EVENTS.MESSAGE.CREATED, {
          //   channelId: args.channelId,
          //   messageCreated: { ...message.dataValues },
          // });
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
        () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
        (payload, { channelId }) => payload.channelId === channelId,
      ),
    },
  },
  DirectMessage: {
    sender: ({ sender, senderId }, args, { models }) => {
      if (sender) {
        return sender;
      }
      return models.User.findOne({ where: { id: senderId } });
    },
  },
};
