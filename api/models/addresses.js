const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('addresses', {
    addressId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    zip: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    prefCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    perf: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    addition: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tel1: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    tel2: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    tel3: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'addresses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "addressId" },
        ]
      },
    ]
  });
};
