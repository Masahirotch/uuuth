'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('shops', 'tag', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('shops', 'tag', {
      type: Sequelize.BIGINT(64),
      allowNull: false,
      defaultValue: 0,
    });
  },
};