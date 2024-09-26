'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('m_units', {
      id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      value: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('m_units');
  }
};
