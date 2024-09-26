'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_images', {
      gid: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      origin: {
        type: Sequelize.BLOB('medium'),
        allowNull: true,
      },
      thumb: {
        type: Sequelize.BLOB('medium'),
        allowNull: true,
      },
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fileType: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_images');
  }
};
