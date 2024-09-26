'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'postages' table
        await queryInterface.changeColumn(
            'postages',
            'shop_code',
            {
                type: Sequelize.STRING(20),
                allowNull: true,
                collate: 'utf8mb4_unicode_ci',
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'postages' table
        await queryInterface.changeColumn(
            'postages',
            'shop_code',
            {
                type: Sequelize.STRING(20),
                allowNull: false,
                collate: 'utf8mb4_unicode_ci',
            }
        );
    },
};
