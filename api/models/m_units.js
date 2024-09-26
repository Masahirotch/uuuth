const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const m_units = sequelize.define(
    "m_units",
    {
      id: {
        type: DataTypes.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      value: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "m_units",
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

  return m_units;
};
