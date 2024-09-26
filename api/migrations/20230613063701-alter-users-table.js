'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn('users', 'isParent', {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        collate: 'utf8mb4_unicode_ci',
        defaultValue: 1
      }, { transaction });

      await queryInterface.changeColumn('users', 'userName', {
        type: Sequelize.STRING(255),
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
      }, { transaction });

      await queryInterface.changeColumn('users', 'shopId', {
        type: Sequelize.BIGINT,
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
      }, { transaction });

      await queryInterface.sequelize.query('ALTER TABLE `users` MODIFY `salesChannel` BIT(4) DEFAULT NULL;', { transaction });

      await queryInterface.changeColumn('users', 'regist', {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'active', {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'purchase', {
        type: Sequelize.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'deleteFlg', {
          type: Sequelize.TINYINT(1),
          allowNull: true,
          defaultValue: 0,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.changeColumn('users', 'isParent', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        collate: 'utf8mb4_unicode_ci',
        defaultValue: 1
      }, { transaction });

      await queryInterface.changeColumn('users', 'userName', {
        type: Sequelize.STRING(255),
        allowNull: false,
        collate: 'utf8mb4_unicode_ci'
      }, { transaction });

      await queryInterface.changeColumn('users', 'shopId', {
        type: Sequelize.BIGINT,
        allowNull: false,
        collate: 'utf8mb4_unicode_ci'
      }, { transaction });

      await queryInterface.sequelize.query('ALTER TABLE `users` MODIFY `salesChannel` BIT(4) NOT NULL;', { transaction });

      await queryInterface.changeColumn('users', 'regist', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'active', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'purchase', {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.changeColumn('users', 'deleteFlg', {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: 0,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
