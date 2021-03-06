export default (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'message',
    {
      text: DataTypes.STRING,
      url: DataTypes.STRING,
      fileType: DataTypes.STRING,
    },
    {
      indexes: [
        {
          fields: ['created_at'],
        },
      ],
    },
  );

  Message.associate = models => {
    // 1:M
    Message.belongsTo(models.Channel, {
      foreignKey: 'channelId',
    });
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return Message;
};
