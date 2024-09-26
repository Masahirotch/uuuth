'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Convert 'adminLine' column to allow null values
            await queryInterface.changeColumn(
                'administrators',
                'adminLine',
                {
                    type: Sequelize.STRING(128),
                    allowNull: true,
                    collate: 'utf8mb4_unicode_ci',
                },
                { transaction }
            );

            // Convert 'privilege' column to allow null values
            await queryInterface.changeColumn(
                'administrators',
                'privilege',
                {
                    type: Sequelize.INTEGER(11),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            // Convert 'deleteFlg' column to allow null values
            await queryInterface.changeColumn(
                'administrators',
                'deleteFlg',
                {
                    type: Sequelize.INTEGER(11),
                    allowNull: true,
                    defaultValue: null,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Revert the changes made to the 'adminLine' column
            await queryInterface.changeColumn(
                'administrators',
                'adminLine',
                {
                    type: Sequelize.STRING(128),
                    allowNull: false,
                    collate: 'utf8mb4_unicode_ci',
                },
                { transaction }
            );

            // Revert the changes made to the 'privilege' column
            await queryInterface.changeColumn(
                'administrators',
                'privilege',
                {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0,
                },
                { transaction }
            );

            // Revert the changes made to the 'deleteFlg' column
            await queryInterface.changeColumn(
                'administrators',
                'deleteFlg',
                {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0,
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
