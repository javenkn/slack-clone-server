import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const member = await models.Member.findOne(
            { where: { teamId: args.teamId, userId: user.id } },
            { raw: true },
          );
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'name',
                  message:
                    'You have to be the owner of the team to create channels.',
                },
              ],
            };
          }

          const response = await models.sequelize.transaction(
            async transaction => {
              const channel = await models.Channel.create(args, {
                transaction,
              });
              if (!args.public) {
                const members = args.members.filter(m => m !== user.id);
                members.push(user.id);
                const privateMembers = args.members.map(m => ({
                  userId: m,
                  channelId: channel.dataValues.id,
                }));
                await models.PrivateMember.bulkCreate(privateMembers, {
                  transaction,
                });
              }
              return channel;
            },
          );
          return {
            ok: true,
            channel: response,
          };
        } catch (error) {
          console.log(error);
          return {
            ok: false,
            errors: formatErrors(error, models),
          };
        }
      },
    ),
  },
};
