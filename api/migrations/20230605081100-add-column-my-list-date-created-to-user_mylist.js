'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_mylist', 'mylistDateCreated', {
      type: Sequelize.DATE,
      collate: 'utf8mb4_unicode_ci',
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_mylist', 'mylistDateCreated');
  }
};