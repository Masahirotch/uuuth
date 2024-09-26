const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const user_mylist = sequelize.define(
    "user_mylist",
    {
      list_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      mylistDateCreated: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      list_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: "list",
      },
    },
    {
      sequelize,
      tableName: "user_mylist",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "list_id" }],
        },
      ],
    }
  );

  return user_mylist;
};
