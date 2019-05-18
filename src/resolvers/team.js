import formatErrors from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, userId }) => {
        try {
          await models.Team.create({ ...args, owner: userId });
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
  },
};
