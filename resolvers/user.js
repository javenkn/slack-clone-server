import _ from 'lodash';

import { tryLogin } from '../auth';

/*
 *  lodash pick
 *  _.pick({ a: 1, b: 2 }, 'a') => { a: 1 }
 */

const formatErrors = (e, models) => {
  if (e instanceof models.Sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'Something went wrong.' }];
};

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
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
};
