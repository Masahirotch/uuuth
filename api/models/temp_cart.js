const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const temp_cart = sequelize.define('temp_cart', {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "商品ID"
    },
    user_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "注文者のLINE User ID"
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "注文時の単価"
    },
    group_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "商品化価格適用店舗グループ"
    },
    product_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "商品コード"
    },
    product_name: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "商品名"
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "カート数量"
    },
    shop_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "店舗コード"
    }
  }, {
    sequelize,
    tableName: 'temp_cart',
    timestamps: false,
    primaryKey: false,
    indexes: [
      {
        name: "cart_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "product_id" },
          { name: "user_id" },
        ]
      },
    ]
  });

  temp_cart.removeAttribute('id');
  return temp_cart;
};
