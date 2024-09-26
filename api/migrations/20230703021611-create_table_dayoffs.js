'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dayoffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      date: {
        type: Sequelize.DATE,
        allowNull: true,
        unique: true,
        defaultValue: null
      },
      shipping: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dayoffs');
  }
};
