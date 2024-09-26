const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const user_favorites = sequelize.define(
    "user_favorites",
    {
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "user_favorites",
      timestamps: false,
      indexes: [
        {
          name: "user_favorites_user_id_product_id",
          unique: true,
          using: "BTREE",
          fields: ["user_id", "product_id"],
        },
      ],
    }
  );

  return user_favorites;
};
