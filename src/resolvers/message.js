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
      async (parent, { channelId, offset }, { models, user }) => {
        const channel = await models.Channel.findOne(
          { where: { id: channelId } },
          { raw: true },
        );

        if (!channel.public) {
          const member = await models.PrivateMember.findOne(
            { where: { channelId, userId: user.id } },
            { raw: true },
          );
          if (!member) {
            throw new Error('Not Authorized.');
          }
        }

        return models.Message.findAll(
          {
            order: [['createdAt', 'ASC']],
            where: { channelId },
            limit: 35,
            offset,
          },
          { raw: true },
        );
      },
    ),
  },
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { file, ...args }, { models, user }) => {
        try {
          const messageData = args;

          if (file) {
            const { createReadStream, mimetype, filename } = await file;
            await new Promise(res =>
              createReadStream()
                .pipe(
                  createWriteStream(
                    path.join(__dirname, '../images', filename),
                  ),
                )
                .on('close', res),
            );

            messageData.url = `http://localhost:3000/images/${filename}`;
            messageData.fileType = mimetype;
          }

          const message = await models.Message.create({
            ...messageData,
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
