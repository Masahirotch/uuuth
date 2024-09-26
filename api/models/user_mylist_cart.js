const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const user_mylist_cart = sequelize.define(
    "user_mylist_cart",
    {
      product_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
      },
      list_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        defaultValue: 0,
      },
      group_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      product_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      product_name: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        defaultValue: 0,
      },
      shop_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "user_mylist_cart",
      timestamps: false,
    }
  );
  
  user_mylist_cart.associate = (models) => {
    user_mylist_cart.belongsTo(models.products, {
      foreignKey: 'product_id',
      targetKey: 'productId',
      as: 'product'
    });
  };

  user_mylist_cart.removeAttribute('id')
  return user_mylist_cart;
};
