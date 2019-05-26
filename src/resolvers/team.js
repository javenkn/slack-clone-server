import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Query: {
    allTeams: combineResolvers(
      isAuthenticated,
      (parent, args, { models, user }) =>
        models.Team.findAll({ where: { owner: user.id } }, { raw: true }),
    ),
    memberOfTeams: combineResolvers(
      isAuthenticated,
      (parent, args, { models, user }) =>
        models.sequelize.query(
          'select * from teams join members on id = team_id where user_id = ?',
          { model: models.Team, replacements: [user.id] },
        ),
    ),
    // memberOfTeams: combineResolvers(
    //   isAuthenticated,
    //   (parent, args, { models, user }) =>
    //     models.Team.findAll(
    //       {
    //         include: {
    //           model: models.User,
    //           where: { id: user.id },
    //         },
    //       },
    //       { raw: true },
    //     ),
    // ),
  },
  Mutation: {
    addTeamMember: combineResolvers(
      isAuthenticated,
      async (parent, { email, teamId }, { models, user }) => {
        try {
          const teamPromise = models.Team.findOne(
            { where: { id: teamId } },
            { raw: true },
          );
          const userToAddPromise = models.User.findOne(
            { where: { email } },
            { raw: true },
          );
          const [team, userToAdd] = await Promise.all([
            teamPromise,
            userToAddPromise,
          ]);
          if (team.owner !== user.id) {
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
