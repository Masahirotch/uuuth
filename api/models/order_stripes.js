const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_stripes', {
    order_stripe_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    capture_method: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    client_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    confirmation_method: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    object: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    payment_method_types: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING(64),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_stripes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_stripe_id" },
        ]
      },
      {
        name: "order_stripes_order_id",
        using: "BTREE",
        fields: [
          { name: "orderId" },
        ]
      },
    ]
  });
};
