import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import 'dotenv/config';

import models from './src/models';
import getUser from './src/helpers/getUser';

const SECRET = process.env.SECRET;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './src/schemas')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './src/resolvers')),
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // get the user token from the headers
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];
    // try to retrieve a user with the token
    const userId = await getUser(token);
    // add the user to the context
    return {
      models,
      userId,
      SECRET,
    };
  },
});
const app = express();
app.use(cors('localhost:3001'));

// const addUser = async (req, res, next) => {
//   const token = req.headers['x-token'];
//   if (token) {
//     try {
//       const { user } = jwt.verify(token, SECRET);
//       req.user = user;
//     } catch (err) {
//       const refreshToken = req.headers['x-refresh-token'];
//       const newTokens = await refreshTokens(
//         token,
//         refreshToken,
//         models,
//         SECRET,
//       );
//       if (newTokens.token && newTokens.refreshToken) {
//         res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
//         res.set('x-token', newTokens.token);
//         res.set('x-refresh-token', newTokens.refreshToken);
//       }
//       req.user = newTokens.user;
//     }
//   }
//   next();
// };

// app.use(addUser);

server.applyMiddleware({ app });

models.sequelize
  .sync() // { force: true } => drops tables before syncing
  .then(() =>
    app.listen({ port: 3000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:3000${server.graphqlPath}`,
      ),
    ),
  );
