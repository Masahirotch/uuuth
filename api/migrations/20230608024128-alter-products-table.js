'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modifying columns to allow null values
    await queryInterface.changeColumn('products', 'productCode', {
      type: Sequelize.STRING(16),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'productName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'productGroup', {
      type: Sequelize.STRING(255),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'salesChannel', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });

    await queryInterface.changeColumn('products', 'productPriceB', {
      type: Sequelize.INTEGER(7),
      allowNull: true
    });

    await queryInterface.changeColumn('products', 'productPriceC', {
      type: Sequelize.INTEGER(7),
      allowNull: true
    });

    await queryInterface.changeColumn('products', 'productPriceBC', {
      type: Sequelize.INTEGER(7),
      allowNull: true
    });

    await queryInterface.changeColumn('products', 'productPriceM', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'productPriceS', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'taxRate', {
      type: Sequelize.INTEGER(3),
      allowNull: true
    });

    await queryInterface.changeColumn('products', 'unit', {
      type: Sequelize.STRING(16),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'lot', {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      defaultValue: 1
    });

    await queryInterface.changeColumn('products', 'shop', {
      type: Sequelize.INTEGER(1),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'quantity', {
      type: Sequelize.INTEGER(1),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'maxNum', {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'isOnsale', {
      type: Sequelize.TINYINT(1),
      allowNull: true,
      defaultValue: 1
    });

    await queryInterface.changeColumn('products', 'deleteFlg', {
      type: Sequelize.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('products', 'productPriceBS', {
      type: Sequelize.INTEGER(7),
      allowNull: true,
      after: 'productPriceB',
    });

    await queryInterface.addColumn('products', 'optInfo1', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'lot',
    });

    await queryInterface.addColumn('products', 'optInfo2', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'optInfo1',
    });

    await queryInterface.addColumn('products', 'optInfo3', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'optInfo2',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting the changes by setting the columns back to NOT NULL
    await queryInterface.changeColumn('products', 'productCode', {
      type: Sequelize.STRING(16),
      allowNull: false,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'productName', {
      type: Sequelize.STRING(255),
      allowNull: false,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'salesChannel', {
      type: Sequelize.BOOLEAN,
      allowNull: false
    });

    await queryInterface.changeColumn('products', 'productPriceB', {
      type: Sequelize.INTEGER(7),
      allowNull: false
    });

    await queryInterface.changeColumn('products', 'productPriceC', {
      type: Sequelize.INTEGER(7),
      allowNull: false
    });

    await queryInterface.changeColumn('products', 'productPriceBC', {
      type: Sequelize.INTEGER(7),
      allowNull: false
    });

    await queryInterface.changeColumn('products', 'productPriceM', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'productPriceS', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'taxRate', {
      type: Sequelize.INTEGER(3),
      allowNull: false
    });

    await queryInterface.changeColumn('products', 'unit', {
      type: Sequelize.STRING(16),
      allowNull: false,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.changeColumn('products', 'lot', {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.changeColumn('products', 'shop', {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'quantity', {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'maxNum', {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'isOnsale', {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.changeColumn('products', 'deleteFlg', {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('products', 'productGroup', {
      type: Sequelize.STRING(16),
      allowNull: true,
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.removeColumn('products', 'productPriceBS');
    await queryInterface.removeColumn('products', 'optInfo1');
    await queryInterface.removeColumn('products', 'optInfo2');
    await queryInterface.removeColumn('products', 'optInfo3');
  }
};