'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('order_stripes', 'id', {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'amount', {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('order_stripes', 'capture_method', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'client_secret', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'confirmation_method', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'created', {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('order_stripes', 'currency', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'object', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'payment_method', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'payment_method_types', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'status', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addColumn('order_stripes', 'userId', {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_unicode_ci'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('order_stripes', 'id');
    await queryInterface.removeColumn('order_stripes', 'amount');
    await queryInterface.removeColumn('order_stripes', 'status');
    await queryInterface.removeColumn('order_stripes', 'payment_method_types');
    await queryInterface.removeColumn('order_stripes', 'payment_method');
    await queryInterface.removeColumn('order_stripes', 'object');
    await queryInterface.removeColumn('order_stripes', 'currency');
    await queryInterface.removeColumn('order_stripes', 'created');
    await queryInterface.removeColumn('order_stripes', 'confirmation_method');
    await queryInterface.removeColumn('order_stripes', 'client_secret');
    await queryInterface.removeColumn('order_stripes', 'capture_method');
    await queryInterface.removeColumn('order_stripes', 'userId');
  }
};
