import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import http from 'http';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import 'dotenv/config';
import DataLoader from 'dataloader';
import { existsSync, mkdirSync } from 'fs';

import models from './models';
import getUser from './helpers/getUser';
import { channelBatcher, userBatcher } from './helpers/batchFunctions';

const SECRET = process.env.SECRET;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers')),
);

existsSync(path.join(__dirname, '../files')) ||
  mkdirSync(path.join(__dirname, '../files'));

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
        userLoader: new DataLoader(ids => userBatcher(ids, models)),
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
        return {
          models,
          user,
          userLoader: new DataLoader(ids => userBatcher(ids, models)),
        };
      }

      return { models };
    },
  },
});

const app = express();

app.use(cors());
app.use('/files', express.static(path.join(__dirname, '../files')));

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
