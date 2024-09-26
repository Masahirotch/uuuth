'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn('users', 'tag', {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: 'purchase',
        defaultValue: null,
      }, { transaction })
  
      await queryInterface.sequelize.query(`
        UPDATE users
        LEFT JOIN shops ON users.shopId = shops.shopId
        SET users.tag = shops.tag
      `, { transaction })
      
      await transaction.commit()
    } catch (err) {
      await transaction.rollback();
      console.log(err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'tag')
  }
};
