'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the 'shops' table columns to allow null values
    await queryInterface.changeColumn(
        'shops',
        'shopName',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'bizName',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'addressId',
        {
          type: Sequelize.BIGINT(20),
          allowNull: true,
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'deleteFlg',
        {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: 0,
        }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes made to the 'shops' table columns
    await queryInterface.changeColumn(
        'shops',
        'shopName',
        {
          type: Sequelize.STRING(255),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'bizName',
        {
          type: Sequelize.STRING(255),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'addressId',
        {
          type: Sequelize.BIGINT(20),
          allowNull: false,
        }
    );

    await queryInterface.changeColumn(
        'shops',
        'deleteFlg',
        {
          type: Sequelize.INTEGER(1),
          allowNull: false,
          defaultValue: 0,
        }
    );
  },
};
