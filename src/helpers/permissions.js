import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';
import Sequelize from 'sequelize';

const op = Sequelize.Op;

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

export const isDirectMessage = combineResolvers(
  async (parent, { teamId, userId }, { user, models }) => {
    if (!user) {
      throw new Error('Not authenticated.');
    }
    const members = await models.Member.findAll({
      where: { teamId, [op.or]: [{ userId }, { userId: user.id }] },
    });

    if (members.length !== 2) {
      throw new Error('Something went wrong.');
    }
  },
);
