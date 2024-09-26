'use strict';

const { QueryTypes } = require('sequelize');
const seedData = [
  { size_code: 'L', size_name: 'Lサイズ' },
  { size_code: 'M', size_name: 'Mサイズ' },
  { size_code: 'S', size_name: 'Sサイズ' }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the const_sizes table
    await queryInterface.createTable('const_sizes', {
      size_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      size_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Insert seed data
    await queryInterface.bulkInsert('const_sizes', seedData, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the const_sizes table
    await queryInterface.dropTable('const_sizes');
  }
};
