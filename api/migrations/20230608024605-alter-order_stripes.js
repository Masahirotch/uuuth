'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'order_stripes' table
        await queryInterface.changeColumn(
            'order_stripes',
            'orderId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: true,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'order_stripes' table
        await queryInterface.changeColumn(
            'order_stripes',
            'orderId',
            {
                type: Sequelize.BIGINT(20),
                allowNull: false,
            }
        );
    },
};
