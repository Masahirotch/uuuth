const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_pricerevision', {
    productId: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    productPriceB: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productPriceBS: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productPriceC: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productPriceBC: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'product_pricerevision',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "productId" },
        ]
      },
    ]
  });
};
