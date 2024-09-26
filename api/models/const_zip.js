const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('const_zip', {
    ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    prefCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prefName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cityCode: {
      type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
      allowNull: true
    },
    cityName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    distCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sectionCode: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sectionName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    printName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    zip: {
      type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'const_zip',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID" },
        ]
      },
    ]
  });
};
