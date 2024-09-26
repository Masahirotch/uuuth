const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const carts = sequelize.define('carts', {
    cartId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    productId: {
      type: DataTypes.BIGINT,
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
    price: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'carts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "cartId"},
        ]
      },
      {
        name: "carts_order_id",
        using: "BTREE",
        fields: [
          {name: "orderId"},
        ]
      },
    ]
  });

  carts.associate = (models) => {
    carts.belongsTo(models.orders, {
      foreignKey: 'orderId',
      targetKey: 'orderId'
    });

    carts.hasOne(models.products, {
      foreignKey: 'productId',
      sourceKey: 'productId'
    });
  };

  return carts;
};
