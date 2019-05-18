export default {
  Mutation: {
    createMessage: async (parent, args, { models, userId }) => {
      try {
        await models.Message.create({ ...args, userId });
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
};
