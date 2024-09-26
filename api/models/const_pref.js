const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('const_pref', {
    pref_code: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      primaryKey: true
    },
    jp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'const_pref',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pref_code" },
        ]
      },
    ]
  });
};
