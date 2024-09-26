'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn(
        'shops',
        'shopPickup',
        {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
          defaultValue: 0
        },
        { transaction }
      );
  
      await queryInterface.changeColumn(
        'shops',
        'deleteFlg',
        {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
          defaultValue: 0
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.changeColumn(
        'shops',
        'shopPickup',
        {
          type: Sequelize.TINYINT(1),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
          defaultValue: 0
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        'shops',
        'deleteFlg',
        {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
          defaultValue: 0
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
