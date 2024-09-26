const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_cart', {
    cart_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    product_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    update_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    size_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_cart',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cart_id" },
        ]
      },
    ]
  });
};
