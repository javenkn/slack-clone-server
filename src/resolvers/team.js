import formatErrors from '../helpers/formatErrors';

export default {
  Mutation: {
    createTeam: async (parent, args, { models, userId }) => {
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
  },
};
