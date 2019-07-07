/**
 * Returns array of channels
 * @param {Int[]} ids
 * @param {*} models
 * @param {*} user
 */
export const channelBatcher = async (ids, models, user) => {
  const results = await models.sequelize.query(
    `
  select distinct on (id) *
  from channels as c left outer join private_members as pm 
  on c.id = pm.channel_id
  where c.team_id in (:teamIds) and (c.public = true or pm.user_id = :userId);`,
    {
      replacements: { teamIds: ids, userId: user.id },
      model: models.Channel,
      raw: true,
    },
  );

  // group by team
  const data = results.reduce((dataAcc, result) => {
    if (dataAcc[result.team_id]) {
      dataAcc[result.team_id].push(result);
    } else {
      dataAcc[result.team_id] = [result];
    }
    return dataAcc;
  }, {});

  // [[name: 'general'], [], [], ...]
  return ids.map(id => data[id]);
};

/**
 * Returns array of users
 * @param {Int[]} ids
 * @param {*} models
 */
export const userBatcher = async (ids, models) => {
  const results = await models.sequelize.query(
    `
  select *
  from users as u
  where u.id in (:userIds)`,
    {
      replacements: { userIds: ids },
      model: models.User,
      raw: true,
    },
  );

  // group by user id
  const data = results.reduce((dataAcc, result) => {
    dataAcc[result.id] = result;
    return dataAcc;
  }, {});

  // [{id: 1, username: 'admin'}, {}, {}, ...]
  return ids.map(id => data[id]);
};
