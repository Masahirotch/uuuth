'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('administrators', 'adminLine', {
      type: Sequelize.STRING(128),
      allowNull: false,
      after: 'adminName'
    });
    await queryInterface.addColumn('administrators', 'password', {
      type: Sequelize.STRING(255),
      defaultValue: null,
      after: 'adminName'
    });
    await queryInterface.addColumn('administrators', 'deleteFlg', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'privilege'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('administrators', 'adminLine');
    await queryInterface.removeColumn('administrators', 'password');
    await queryInterface.removeColumn('administrators', 'deleteFlg');

  }
};
