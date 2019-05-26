import { combineResolvers } from 'graphql-resolvers';

import formatErrors from '../helpers/formatErrors';
import { isAuthenticated } from '../helpers/permissions';

export default {
  Mutation: {
    createChannel: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, user }) => {
        try {
          const member = await models.Member.findOne(
            { where: { teamId: args.teamId, userId: user.id } },
            { raw: true },
          );
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'name',
                  message:
                    'You have to be the owner of the team to create channels.',
                },
              ],
            };
          }
          const channel = await models.Channel.create(args);
          return {
            ok: true,
            channel,
          };
        } catch (error) {
          console.log(error);
          return {
            ok: false,
            errors: formatErrors(error, models),
          };
        }
      },
    ),
  },
};
