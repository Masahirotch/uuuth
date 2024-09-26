const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tags', {
    tagId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true
    },
    tagValue: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    deleteFlg: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'tags',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tagId" },
        ]
      },
      {
        name: "tagId",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tagId" },
        ]
      },
    ]
  });
};
