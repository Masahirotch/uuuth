'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('consumers', 'appId', {
        collate: 'utf8mb4_unicode_ci',
        type: Sequelize.INTEGER(11),
        allowNull: true
      }, { transaction })

      await queryInterface.changeColumn('consumers', 'addressId', {
        type: Sequelize.BIGINT,
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
      }, { transaction })

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('consumers', 'appId')

      await queryInterface.changeColumn('consumers', 'addressId', {
        type: Sequelize.BIGINT,
        allowNull: false
      })

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
