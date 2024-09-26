'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('article_images', {
      gid: {
        type: Sequelize.INTEGER(11).UNSIGNED,
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
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_images');
  }
};
