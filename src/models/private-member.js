export default (sequelize, DataTypes) => {
  const PrivateMember = sequelize.define('private_member', {});

  return PrivateMember;
};
