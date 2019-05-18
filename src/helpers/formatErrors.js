import _ from 'lodash';

/*
 *  lodash pick
 *  _.pick({ a: 1, b: 2 }, 'a') => { a: 1 }
 */

export default (e, models) => {
  if (e instanceof models.Sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'Something went wrong.' }];
};
