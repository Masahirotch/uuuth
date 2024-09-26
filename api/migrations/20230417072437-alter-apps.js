'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('apps', 'shop_code', {
      type: Sequelize.STRING(20),
      allowNull: false,
      after: 'app_name'
    });
    await queryInterface.addColumn('apps', 'msg_channel_id', {
      type: Sequelize.STRING(255),
      defaultValue: null,
      after: 'app_name'
    });
    await queryInterface.addColumn('apps', 'deleteFlg', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'terms'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('apps', 'shop_code');
    await queryInterface.removeColumn('apps', 'msg_channel_id');
    await queryInterface.removeColumn('apps', 'deleteFlg');
  }
};
