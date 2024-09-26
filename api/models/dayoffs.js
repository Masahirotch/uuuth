const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  const dayoffs = sequelize.define(
    "dayoffs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
        unique: true
      },
      shipping: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0
      }
    },
    {
      sequelize,
      tableName: "dayoffs",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
					name: "date",
					unique: true,
					using: "BTREE",
					fields: [
						{name: "date"},
					]
        },
      ],
    }
  );

  return dayoffs;
};
