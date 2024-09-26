const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const shops = sequelize.define('shops', {
    shopId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    shopCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "shopCode"
    },
    shopName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bizName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shopTel: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    shopGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    addressId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    shopPickup: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    closing: {
      type: DataTypes.TIME,
      allowNull: true
    },
    deleteFlg: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'shops',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "shopId"},
        ]
      },
      {
        name: "shopCode",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "shopCode"},
        ]
      },
    ]
  });

  shops.associate = (models) => {
    shops.hasOne(models.addresses, {
      foreignKey: 'addressId',
      sourceKey: 'addressId'
    });

    shops.belongsTo(models.shop_groups, {
      foreignKey: 'shopGroupId',
      targetKey: 'shopGroupId'
    });

    shops.hasMany(models.users, {
      foreignKey: 'shopId',
      sourceKey: 'shopId'
    });
  };

  return shops;
};
