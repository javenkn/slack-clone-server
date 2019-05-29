import { withFilter } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from '../helpers/permissions';
import pubsub, { EVENTS } from '../subscription';

export default {
  Query: {
    directMessages: combineResolvers(
      isAuthenticated,
      (parent, { teamId, otherUserId }, { models, user }) => {
        return models.DirectMessage.findAll(
          {
            order: [['createdAt', 'ASC']],
            where: {
              teamId,
              [models.Sequelize.Op.or]: [
                {
                  [models.Sequelize.Op.and]: [
                    { receiverId: otherUserId },
                    { senderId: user.id },
                  ],
                },
                {
                  [models.Sequelize.Op.and]: [
                    { receiverId: user.id },
                    { senderId: otherUserId },
                  ],
                },
              ],
            },
          },
          { raw: true },
        );
      },
    ),
  },
  Mutation: {
    createDirectMessage: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const directMessage = await models.DirectMessage.create({
            ...args,
            senderId: user.id,
          });
          pubsub.publish(EVENTS.DIRECT_MESSAGE.DM_CREATED, {
            teamId: args.teamId,
            senderId: user.id,
            receiverId: args.receiverId,
            directMessageCreated: {
              ...directMessage.dataValues,
              sender: {
                username: user.username,
              },
            },
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
    directMessageCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.DIRECT_MESSAGE.DM_CREATED),
        (payload, { teamId, userId }, { user }) => {
          console.log({ payload, teamId, userId, user });
          console.log('alksdjflksdjfalksdjfaskljfalskdjf');
          console.log(
            payload.teamId === teamId,
            payload.senderId === user.id,
            payload.receiverId === userId,
            payload.senderId === parseInt(userId),
            payload.receiverId === user.id,
            payload.teamId === teamId &&
              ((payload.senderId === user.id &&
                payload.receiverId === userId) ||
                (payload.senderId === parseInt(userId) &&
                  parseInt(payload.receiverId) === user.id)),
          );
          return (
            payload.teamId === teamId &&
            ((payload.senderId === user.id && payload.receiverId === userId) ||
              (payload.senderId === parseInt(userId) &&
                parseInt(payload.receiverId) === user.id))
          );
        },
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
