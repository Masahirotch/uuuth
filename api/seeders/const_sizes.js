'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('const_sizes', null, {});
    const data = [
      { size_code: 'L', size_name: 'Lサイズ' },
      { size_code: 'M', size_name: 'Mサイズ' },
      { size_code: 'S', size_name: 'Sサイズ' }
    ];

    await queryInterface.bulkInsert('const_sizes', data, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('const_sizes', null, {});
  }
};