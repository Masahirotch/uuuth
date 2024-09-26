'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class info_orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  info_orders.init({
    order_id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT.UNSIGNED
    },
    userId: DataTypes.STRING(128),
    orderArray: DataTypes.JSON,
    orderNum: DataTypes.INTEGER(6),
    orderDate: DataTypes.DATE,
    deliveryDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'info_orders',
    timestamps: false,
  });
  return info_orders;
};