import jwt from 'jsonwebtoken';
const SECRET = 'GraphQL-is-aw3some';

function getUser(reqToken) {
  if (reqToken) {
    const token = reqToken.replace('Bearer ', '');
    try {
      const { userId } = jwt.verify(token, SECRET);
      return userId;
    } catch (err) {
      throw new Error('Not authenticated');
    }
  }

  throw new Error('Not authenticated');
}

module.exports = {
  SECRET,
  getUser,
};
