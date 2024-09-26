'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'salesChannel' column from the 'product_units' table
    await queryInterface.removeColumn('product_units', 'salesChannel');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the removal of the 'salesChannel' column in the 'product_units' table
    await queryInterface.sequelize.query('ALTER TABLE `product_units` ADD COLUMN `salesChannel` BIT(4) NOT NULL AFTER `unitId`;');
  },
};
