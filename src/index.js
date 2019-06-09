import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import http from 'http';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import 'dotenv/config';
import DataLoader from 'dataloader';

import models from './models';
import getUser from './helpers/getUser';
import { channelBatcher } from './helpers/batchFunctions';

const SECRET = process.env.SECRET;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers')),
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
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
        channelLoader: new DataLoader(ids => channelBatcher(ids, models, user)),
        serverUrl: `${req.protocol}://${req.get('host')}`,
      };
    }
  },
  subscriptions: {
    onConnect: async ({ token }) => {
      if (token) {
        const user = await getUser(token);
        if (!user) {
          return { models };
        }
        return { models, user };
      }

      return { models };
    },
  },
});

const app = express();
app.use(cors('localhost:3001'));
app.use('/images', express.static(path.join(__dirname, '../images')));

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
