const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const user = sequelize.define('users', {
    userId: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    isParent: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 1
    },
    userCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "userCode"
    },
    userLine: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ordererName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shopId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'shops',
        key: 'shopId'
      }
    },
    salesChannel: {
      type: "BIT(4)",
      allowNull: true
    },
    userTel: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    regist: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    active: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    purchase: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    deleteFlg: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "userId"},
        ]
      },
      {
        name: "userCode",
        unique: true,
        using: "BTREE",
        fields: [
          {name: "userCode"},
        ]
      },
      {
        name: "shopId",
        using: "BTREE",
        fields: [
          {name: "shopId"},
        ]
      },
    ]
  });

  user.associate = (models) => {
    user.belongsTo(models.shops, {foreignKey: 'shopId', targetKey: 'shopId'});
  };

  return user;
};
