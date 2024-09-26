'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('product_groups', 'productGroup', 'groupId');

    await queryInterface.changeColumn('product_groups', 'groupId', {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('product_groups', 'groupId', {
      type: Sequelize.STRING(16),
      autoIncrement: false
    })

    await queryInterface.renameColumn('product_groups', 'groupId', 'productGroup');
  }
};