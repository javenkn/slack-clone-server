import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { tryLogin } from '../helpers/auth';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Query: {
    me: combineResolvers(isAuthenticated, (parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } }),
    ),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET }) =>
      tryLogin(email, password, models, SECRET),
    register: async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args);
        return {
          ok: true,
          user,
        };
      } catch (error) {
        return {
          ok: false,
          errors: formatErrors(error, models),
        };
      }
    },
  },
  User: {
    teams: (parents, args, { models, user }) =>
      models.sequelize.query(
        'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
        { model: models.Team, replacements: [user.id] },
      ),
  },
};
