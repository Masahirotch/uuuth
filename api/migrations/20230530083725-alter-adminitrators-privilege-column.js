'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("UPDATE administrators SET privilege = 0 WHERE privilege IS NULL");
    await queryInterface.changeColumn('administrators', 'privilege', {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('administrators', 'privilege', {
      type: Sequelize.INTEGER(11),
      allowNull: true,
    });
  }
};
