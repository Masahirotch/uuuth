'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Modify the 'product_shops' table columns to allow null values
        await queryInterface.changeColumn(
            'product_shops',
            'productId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'product_shops',
            'shopId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'product_shops' table columns
        await queryInterface.changeColumn(
            'product_shops',
            'productId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'product_shops',
            'shopId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );
    },
};
