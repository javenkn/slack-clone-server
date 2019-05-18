export default {
  Mutation: {
    createChannel: async (parent, args, { models }) => {
      try {
        await models.Channel.create(args);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};
