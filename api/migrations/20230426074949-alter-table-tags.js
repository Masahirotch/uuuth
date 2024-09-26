'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('tags', 'tagId', {
      autoIncrement: true,
      type: Sequelize.INTEGER(11)
    })
    await queryInterface.addColumn('tags', 'deleteFlg', {
      type: Sequelize.TINYINT(1),
      defaultValue: 0,
      after: 'tagValue'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('tags', 'tagId', {
      autoIncrement: false,
      type: Sequelize.TINYINT(2)
    })
    await queryInterface.removeColumn('tags', 'deleteFlg')
  }
};
