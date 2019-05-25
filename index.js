import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import http from 'http';
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
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }

    if (req) {
      // get the user token from the headers
      const tokenWithBearer = req.headers.authorization || '';
      const token = tokenWithBearer.split(' ')[1];
      // try to retrieve a user with the token
      const user = await getUser(token);
      // add the user to the context
      return {
        models,
        user,
        SECRET,
      };
    }
  },
});
const app = express();
app.use(cors('localhost:3001'));

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

models.sequelize
  .sync() // { force: true } => drops tables before syncing
  .then(() =>
    httpServer.listen({ port: 3000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:3000${server.graphqlPath}
🚀 Subscriptions ready at ws://localhost:3000${server.subscriptionsPath}`,
      ),
    ),
  );
