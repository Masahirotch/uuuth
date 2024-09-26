'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Modify the 'product_prices' table columns to allow null values
        await queryInterface.changeColumn(
            'product_prices',
            'productId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'product_prices',
            'shopId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'product_prices',
            'productPrice',
            {
                type: Sequelize.INTEGER(7),
                allowNull: true,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'product_prices' table columns
        await queryInterface.changeColumn(
            'product_prices',
            'productId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'product_prices',
            'shopId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'product_prices',
            'productPrice',
            {
                type: Sequelize.INTEGER(7),
                allowNull: false,
            }
        );
    },
};
