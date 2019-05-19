import jwt from 'jsonwebtoken';

export default async function(token) {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
  return null;
}
