const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('apps', {
    app_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    app_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    app_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    msg_channel_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shop_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    msg_channel_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    msg_access_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    liff_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    theme_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logo_gid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    law_prices: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    law_method: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    law_returned: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    law_service: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    law_other: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    law_about: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_header: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_information: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_purpose: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_consign: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_furnishing: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_line: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    privacy_contact: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deleteFlg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'apps',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "app_id" },
        ]
      },
    ]
  });
};
