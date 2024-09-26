'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the userId and session_id columns to the carts table
    await queryInterface.addColumn('carts', 'userId', {
      type: Sequelize.STRING(64),
      collate: 'utf8mb4_unicode_ci',
      allowNull: true,
    });

    await queryInterface.addColumn('carts', 'session_id', {
      type: Sequelize.STRING(255),
      collate: 'utf8mb4_unicode_ci',
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the userId and session_id columns from the carts table
    await queryInterface.removeColumn('carts', 'userId');
    await queryInterface.removeColumn('carts', 'session_id');
  }
};