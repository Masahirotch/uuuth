const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('postages', {
    postage_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    shop_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    pref_code: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    shipping_flg: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    size_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    shipping_fee: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'postages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "postage_id" },
        ]
      },
    ]
  });
};
