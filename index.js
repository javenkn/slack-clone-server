import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import typeDefs from './typeDefs';
import resolvers from './resolvers';
import models from './models';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const app = express();

server.applyMiddleware({ app });

models.sequelize
  .sync({ force: true }) // { force: true } => drops tables before syncing
  .then(() =>
    app.listen({ port: 3000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:3000${server.graphqlPath}`,
      ),
    ),
  );
