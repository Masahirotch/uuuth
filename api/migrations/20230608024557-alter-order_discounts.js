'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'order_discounts' table
        await queryInterface.changeColumn(
            'order_discounts',
            'orderId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'order_discounts',
            'couponId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );

        await queryInterface.changeColumn(
            'order_discounts',
            'discount',
            {
                type: Sequelize.INTEGER(11),
                allowNull: true,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'order_discounts' table
        await queryInterface.changeColumn(
            'order_discounts',
            'orderId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'order_discounts',
            'couponId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );

        await queryInterface.changeColumn(
            'order_discounts',
            'discount',
            {
                type: Sequelize.INTEGER(11),
                allowNull: false,
            }
        );
    }
};
