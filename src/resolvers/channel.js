import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Mutation: {
    getDMChannel: combineResolvers(
      isAuthenticated,
      async (parent, { teamId, members }, { models, user }) => {
        members.push(user.id);
        // check if channel exists with these members
        const [data, result] = await models.sequelize.query(
          `
          select c.id
          from channels as c, private_members pm
          where pm.channel_id = c.id and c.dm = true and c.public = false and c.team_id = ${teamId}
          group by c.id
          having array_agg(pm.user_id) @> Array[${members.join(
            ',',
          )}] and count(pm.user_id) = ${members.length};
          `,
          { raw: true },
        );

        if (data.length) {
          return data[0].id;
        }

        return await models.sequelize.transaction(async transaction => {
          const channel = await models.Channel.create(
            {
              name: 'hello',
              teamId,
              dm: true,
              public: false,
              members,
            },
            {
              transaction,
            },
          );
          const privateMembers = members.map(m => ({
            userId: m,
            channelId: channel.dataValues.id,
          }));
          await models.PrivateMember.bulkCreate(privateMembers, {
            transaction,
          });
          return channel.dataValues.id;
        });
      },
    ),
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
                const privateMembers = members.map(m => ({
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
