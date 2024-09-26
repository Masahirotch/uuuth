const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
    productId: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    productGroup: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productCode: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productTag: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productSubname: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productOrign: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productDetail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    productArticle: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    productPhoto1: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productPhoto2: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    productPhoto3: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    salesChannel: {
      type: DataTypes.BOOLEAN,
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
    },
    productPriceM: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    productPriceS: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    taxRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    lot: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    optInfo1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    optInfo2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    optInfo3: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    shop: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    maxNum: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isOnsale: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    deleteFlg: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'products',
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
