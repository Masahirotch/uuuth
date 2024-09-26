const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('article_images', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    origin: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    thumb: {
      type: DataTypes.BLOB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'article_images',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "gid" },
        ]
      },
    ]
  });
};
