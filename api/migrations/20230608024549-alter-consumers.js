'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter the 'consumers' table
        await queryInterface.changeColumn(
            'consumers',
            'consumerName',
            {
                type: Sequelize.STRING(255),
                allowNull: true,
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the changes made to the 'consumers' table
        await queryInterface.changeColumn(
            'consumers',
            'consumerName',
            {
                type: Sequelize.STRING(255),
                allowNull: false,
            }
        );
    },
};
