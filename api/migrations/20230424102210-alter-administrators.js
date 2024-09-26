'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change adminId column type to integer
    await queryInterface.changeColumn('administrators', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Change adminId column type back to string
    await queryInterface.changeColumn('administrators', 'adminId', {
      type: Sequelize.STRING(128),
      allowNull: false,
    });
  }
};
