const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shipping_addresses', {
    shippingAddressesId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    consumerId: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    addressId: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'shipping_addresses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shippingAddressesId" },
        ]
      },
    ]
  });
};
