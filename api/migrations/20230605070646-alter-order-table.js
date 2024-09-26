'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('orders', 'arrivalDay', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'deliveryDay',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('orders', 'arrivalDay');
    },
};
