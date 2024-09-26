'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('info_orders', {
      order_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      userId: {
        type: Sequelize.STRING(128),
        defaultValue: null,
      },
      orderArray: {
        type: Sequelize.JSON,
        defaultValue: null,
      },
      orderNum: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
      },
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      deliveryDate: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "order_id" }],
      },
      ],
      initialAutoIncrement: 1220,
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('info_orders');
  }
};