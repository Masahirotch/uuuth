const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const m_delivery = sequelize.define(
    "m_delivery",
    {
      id: {
        type: DataTypes.INTEGER(2).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      shipping: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      tableName: "m_delivery",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  return m_delivery;
};
