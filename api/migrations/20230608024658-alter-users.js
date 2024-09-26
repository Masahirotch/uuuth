'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the 'users' table columns to allow null values
    await queryInterface.changeColumn(
        'users',
        'userCode',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'userLine',
        {
          type: Sequelize.STRING(128),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'ordererName',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'userTel',
        {
          type: Sequelize.STRING(16),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'deleteFlg',
        {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: 0,
        }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes made to the 'users' table columns
    await queryInterface.changeColumn(
        'users',
        'userCode',
        {
          type: Sequelize.STRING(20),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'userLine',
        {
          type: Sequelize.STRING(128),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'ordererName',
        {
          type: Sequelize.STRING(255),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'userTel',
        {
          type: Sequelize.STRING(16),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'users',
        'deleteFlg',
        {
          type: Sequelize.INTEGER(1),
          allowNull: false,
          defaultValue: 0,
        }
    );
  },
};
