import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';

import models from './models';

const SECRET = 'javen777';
const SECRET2 = '777javen';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schemas')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers')),
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    models,
    user: {
      id: 1,
    },
    SECRET,
    SECRET2,
  },
});
const app = express();
app.use(cors('localhost:3001'));

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
