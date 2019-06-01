import { withFilter } from 'apollo-server';
import { combineResolvers } from 'graphql-resolvers';
import { createWriteStream } from 'fs';
import path from 'path';

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
      async (parent, { file, ...args }, { models, user }) => {
        try {
          const messageData = args;
          const { createReadStream, filename } = await file;

          await new Promise(res =>
            createReadStream()
              .pipe(
                createWriteStream(path.join(__dirname, '../images', filename)),
              )
              .on('close', res),
          );

          const message = await models.Message.create({
            ...messageData,
            url: `http://localhost:3000/images/${filename}`,
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
        () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
        (payload, { channelId }) => payload.channelId === channelId,
      ),
    },
  },
  Message: {
    user: ({ userId }, args, { models }) =>
      models.User.findOne({ where: { id: userId } }),
  },
};
