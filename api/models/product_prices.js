const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_prices', {
    pid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    shopId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    productPrice: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'product_prices',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pid" },
        ]
      },
    ]
  });
};
