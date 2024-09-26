const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('product_images', {
    gid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
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
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fileType: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'product_images',
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
