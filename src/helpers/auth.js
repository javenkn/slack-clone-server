import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

export const createToken = async (user, secret) => {
  return jwt.sign({ user }, secret, {
    expiresIn: '1h',
  });
};

export const tryLogin = async (email, password, models, secret) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'No user with this email exists.' }],
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Wrong password.' }],
    };
  }

  const token = await createToken(user, secret);

  return {
    ok: true,
    token,
  };
};
