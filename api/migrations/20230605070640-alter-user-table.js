'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'ordererName', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'userName',
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'ordererName');
    },
};