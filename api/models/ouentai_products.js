'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ouentai_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ouentai_products.init({
    productId: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT.UNSIGNED
    },
    productName: DataTypes.STRING(255),
    productDetail: DataTypes.TEXT,
    productPhoto: DataTypes.STRING(255),
    productPrice: DataTypes.INTEGER(6),
    isOnSale: DataTypes.INTEGER(1),
    quantity: DataTypes.INTEGER(1),
    maxNum: DataTypes.INTEGER(11),
    isMax: DataTypes.INTEGER(1),
    isPeriod: DataTypes.INTEGER(1),
    start: DataTypes.DATE,
    end: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'ouentai_products',
    timestamps: false,
  });
  return ouentai_products;
};