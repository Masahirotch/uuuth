'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('m_delivery', {
      id: {
        type: Sequelize.INTEGER(2).UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      key: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      value: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      shipping: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 1
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('m_delivery');
  }
};
