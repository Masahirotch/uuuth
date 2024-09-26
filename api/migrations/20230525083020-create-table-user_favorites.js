'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('user_favorites', {
        user_id: {
          type: Sequelize.STRING(64),
          allowNull: false
        },
        product_id: {
          type: Sequelize.INTEGER(10),
          allowNull: false
        }
      }, {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        transaction
      });

      await queryInterface.addIndex(
        'user_favorites',
        ['user_id', 'product_id'],
        {
          unique: true,
          using: 'BTREE',
          transaction,
        }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('user_favorites', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
