'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('const_zip', {
      ID: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        primaryKey: true,
      },
      prefCode: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      prefName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      cityCode: {
        type: Sequelize.INTEGER(5).UNSIGNED.ZEROFILL,
        allowNull: true,
      },
      cityName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      distCode: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sectionCode: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      sectionName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      printName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      zip: {
        type: Sequelize.INTEGER(7).UNSIGNED.ZEROFILL,
        allowNull: true,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('const_zip');
  }
};
