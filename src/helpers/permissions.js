import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { user }) => {
  return user ? skip : new ForbiddenError('Not authenticated as user.');
};

export const isTeamMember = combineResolvers(
  isAuthenticated,
  (parent, { channelId }, { user, models }) => console.log('hello'),
  // check if user is part of the team
  // const channel = await models.Channel.findOne({
  //   where: { id: channelId },
  // });
  // const member = await models.Member.findOne({
  //   where: { teamId: channel.teamId, userId: user.id },
  // });
  // if (!member) {
  //   throw new ForbiddenError('You have to be a member to subscribe.');
  // }
  // return skip;
);
