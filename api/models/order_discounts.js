const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_discounts', {
    orderDiscountId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    couponId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_discounts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "orderDiscountId" },
        ]
      },
      {
        name: "order_discounts_order_id",
        using: "BTREE",
        fields: [
          { name: "orderId" },
        ]
      },
    ]
  });
};
