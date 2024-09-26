'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Rename the 'product_info' table to 'product_pricerevision'
        await queryInterface.renameTable('product_info', 'product_pricerevision');

        // Modify the 'product_pricerevision' table columns to allow null values
        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceB',
            {
                type: Sequelize.INTEGER(7),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceC',
            {
                type: Sequelize.INTEGER(7),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceBC',
            {
                type: Sequelize.INTEGER(7),
                allowNull: true,
            }
        );

        await queryInterface.addColumn('product_pricerevision', 'productPriceBS', {
            type: Sequelize.INTEGER(7),
            allowNull: true,
            after: 'productPriceB',
        });
    },

    down: async (queryInterface, Sequelize) => {

        await queryInterface.removeColumn('product_pricerevision', 'productPriceBS');

        // Revert the changes made to 'product_pricerevision' table columns
        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceB',
            {
                type: Sequelize.INTEGER(7),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceC',
            {
                type: Sequelize.INTEGER(7),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'product_pricerevision',
            'productPriceBC',
            {
                type: Sequelize.INTEGER(7),
                allowNull: false,
            }
        );

        // Rename the 'product_pricerevision' table back to 'product_info'
        await queryInterface.renameTable('product_pricerevision', 'product_info');
    },
};