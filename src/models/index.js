import Sequelize from 'sequelize';

// create Sequelize instance that connects to PostgresQL database
const sequelize = new Sequelize(
  process.env.TEST_DB || process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    define: {
      underscored: true,
    },
  },
);

const models = {
  User: sequelize['import']('./user'),
  Channel: sequelize['import']('./channel'),
  Team: sequelize['import']('./team'),
  Member: sequelize['import']('./member'),
  Message: sequelize['import']('./message'),
  DirectMessage: sequelize['import']('./direct-message'),
  PrivateMember: sequelize['import']('./private-member'),
};

// loop through the models and for every model check if has an associate method
// if it does then create an association
Object.keys(models).forEach(modelName => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
