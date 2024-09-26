'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('apps', {
      app_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      app_code: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      app_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      msg_channel_secret: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      msg_access_token: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      liff_id: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      theme_id: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      logo_gid: {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
      law_prices: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      law_method: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      law_returned: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      law_service: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      law_other: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      law_about: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_header: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_information: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_purpose: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_consign: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_furnishing: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_line: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      privacy_contact: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      terms: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('apps');
  }
};
