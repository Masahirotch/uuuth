'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('shops', 'tag')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('shops', 'tag', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'closing',
      defaultValue: null,
    })
  }
};
