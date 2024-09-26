'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product_prices', 'salesChannel');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_prices', 'salesChannel', {
      type: Sequelize.TINYINT(1),
      allowNull: false
    });
  }
};