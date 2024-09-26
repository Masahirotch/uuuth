const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('consumers', {
    consumerId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      primaryKey: true
    },
    consumerName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    addressId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    appId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'consumers',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "consumerId" },
        ]
      },
    ]
  });
};
