'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'apps' table
        await queryInterface.changeColumn(
            'apps',
            'app_code',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'app_name',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'shop_code',
            {
                type: Sequelize.STRING(20),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'deleteFlg',
            {
                type: Sequelize.INTEGER(11),
                allowNull: true,
                defaultValue: 0,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'apps' table
        await queryInterface.changeColumn(
            'apps',
            'app_code',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'app_name',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'shop_code',
            {
                type: Sequelize.STRING(20),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'apps',
            'deleteFlg',
            {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            }
        );
    },
};
