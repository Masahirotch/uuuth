'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('addresses', {
      addressId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      zip: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      prefCode: {
        type: Sequelize.INTEGER(11)
      },
      perf: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      street: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      addition: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tel1: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      tel2: {
        type: Sequelize.STRING(5),
        allowNull: true,
      },
      tel3: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('addresses');
  }
};
