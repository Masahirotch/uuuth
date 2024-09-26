const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const orders = sequelize.define('orders', {
    orderId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    todo: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(12),
      allowNull: true
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    salesChannel: {
      type: "BIT(4)",
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    ordererId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    orderNum: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cartPrice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shippingFee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    orderFee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payment: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    order_stripe_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    orderMemo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    addressId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    deliveryMethod: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    preferredDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    preferredTime: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    deliveryDay: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    arrivalDay: {
      type: DataTypes.DATE,
      allowNull: true
    },
    shipNumber: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    appId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shopuserId: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "orderId"},
        ]
      },
    ]
  });

  orders.associate = (models) => {
    orders.belongsTo(models.apps, {
      foreignKey: 'appId',
      targetKey: 'app_id'
    });

    orders.hasOne(models.order_stripes, {
      foreignKey: 'order_stripe_id',
      sourceKey: 'order_stripe_id'
    });

    orders.belongsTo(models.users, {
      foreignKey: 'ordererId',
      targetKey: 'userId',
      as: 'shopuser',
    });

    orders.hasOne(models.addresses, {
      foreignKey: 'addressId',
      sourceKey: 'addressId'
    });

    orders.hasMany(models.carts, { foreignKey: 'orderId' });
  };

  return orders;
};
