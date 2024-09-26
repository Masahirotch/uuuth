const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    msgId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    laterSend: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastSend: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'messages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "msgId" },
        ]
      },
    ]
  });
};
