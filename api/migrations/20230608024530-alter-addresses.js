'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'addresses' table
        await queryInterface.changeColumn(
            'addresses',
            'zip',
            {
                type: Sequelize.STRING(7),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'city',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'street',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'address',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'name',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to 'addresses' table
        await queryInterface.changeColumn(
            'addresses',
            'zip',
            {
                type: Sequelize.STRING(7),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'city',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'street',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'address',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );

        await queryInterface.changeColumn(
            'addresses',
            'name',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );
    },
};
