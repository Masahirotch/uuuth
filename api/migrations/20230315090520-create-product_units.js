'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_units', {
      unitId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      unitName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
    await queryInterface.sequelize.query('ALTER TABLE `product_units` ADD COLUMN `salesChannel` BIT(4) NOT NULL AFTER `unitId`;');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_units');
  }
};
