const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sizes', {
    size_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    size_text: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sizes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "size_code" },
        ]
      },
    ]
  });
};
