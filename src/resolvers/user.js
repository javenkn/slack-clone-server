import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { tryLogin } from '../helpers/auth';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Query: {
    me: combineResolvers(isAuthenticated, (parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } }),
    ),
    getUser: (parent, { userId }, { models }) =>
      models.User.findOne({ where: { id: userId } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET }) =>
      tryLogin(email, password, models, SECRET),
    register: async (parent, args, { models }) => {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      try {
        const user = await models.User.create({
          ...args,
          color: randomColor === 'ffffff' ? '000000' : randomColor,
        });
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
        { model: models.Team, replacements: [user.id], raw: true },
      ),
  },
};
