import formatErrors from '../helpers/formatErrors';

export default {
  Mutation: {
    createChannel: async (parent, args, { models }) => {
      try {
        const channel = await models.Channel.create(args);
        return {
          ok: true,
          channel,
        };
      } catch (error) {
        console.log(error);
        return {
          ok: false,
          errors: formatErrors(error),
        };
      }
    },
  },
};
