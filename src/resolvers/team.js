import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Query: {
    getTeamMembers: combineResolvers(
      isAuthenticated,
      (parent, { teamId }, { models }) =>
        models.sequelize.query(
          'select * from users as u join members as m on m.user_id = u.id where m.team_id = ?',
          { model: models.User, replacements: [teamId], raw: true },
        ),
    ),
  },
  Mutation: {
    addTeamMember: combineResolvers(
      isAuthenticated,
      async (parent, { email, teamId }, { models, user }) => {
        try {
          const memberPromise = models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true },
          );
          const userToAddPromise = models.User.findOne(
            { where: { email } },
            { raw: true },
          );
          const [member, userToAdd] = await Promise.all([
            memberPromise,
            userToAddPromise,
          ]);
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'You cannot add members to the team.',
                },
              ],
            };
          }
          if (!userToAdd) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'Could not find an user with this email.',
                },
              ],
            };
          }
          await models.Member.create({ userId: userToAdd.id, teamId });
          return {
            ok: true,
          };
        } catch (err) {
          console.log(err);
          return {
            ok: false,
            errors: formatErrors(error, models),
          };
        }
      },
    ),
    createTeam: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const response = await models.sequelize.transaction(async () => {
            const team = await models.Team.create({ ...args, owner: user.id });
            await models.Member.create({
              teamId: team.id,
              userId: user.id,
              admin: true,
            });
            await models.Channel.bulkCreate([
              {
                name: 'general',
                public: true,
                teamId: team.id,
              },
              {
                name: 'random',
                public: true,
                teamId: team.id,
              },
            ]);
            return team;
          });
          return {
            ok: true,
            team: response,
          };
        } catch (err) {
          console.log(err);
          return {
            ok: false,
            errors: formatErrors(err, models),
          };
        }
      },
    ),
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } }),
  },
};
