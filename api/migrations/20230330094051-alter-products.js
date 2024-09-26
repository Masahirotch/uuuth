'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'lot', {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 1,
      after: 'unit'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'lot');
  }
};