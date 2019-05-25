import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated } from '../helpers/permissions';

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
          await models.Message.create({ ...args, userId: user.id });
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
    ),
  },
  Message: {
    user: ({ userId }, args, { models }) =>
      models.User.findOne({ where: { id: userId } }),
  },
};
