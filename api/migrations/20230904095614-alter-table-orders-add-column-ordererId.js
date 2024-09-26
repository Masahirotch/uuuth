'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn('orders', 'ordererId', {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null,
        after: 'userId',
        comment: '発注者のusers.userId',
      }, { transaction });

      await queryInterface.sequelize.query(`
        UPDATE orders
        LEFT JOIN users ON users.userLine = orders.userId
        LEFT JOIN shops ON shops.addressId = orders.addressId
        SET orders.ordererId = users.userId
        WHERE orders.salesChannel & 0b0011 AND users.shopId = shops.shopId
      `, { transaction })
      
      await transaction.commit()
    } catch (error) {
      await transaction.rollback();
      console.log(error)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'ordererId');
  }
};
