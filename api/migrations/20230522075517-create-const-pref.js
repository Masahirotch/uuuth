'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('const_pref', {
      pref_code: {
        type: Sequelize.INTEGER(2),
        allowNull: false,
        primaryKey: true
      },
      jp: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      en: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('const_pref');
  }
};
