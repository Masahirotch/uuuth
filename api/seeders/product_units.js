'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('product_units', null, {});
		await queryInterface.bulkInsert('product_units', [
			{ unitId: 1, unitName: 'パック' },
			{ unitId: 2, unitName: 'ケース' },
			{ unitId: 3, unitName: '束' },
			{ unitId: 4, unitName: '個' },
			{ unitId: 5, unitName: '本' },
			{ unitId: 6, unitName: '株' },
			{ unitId: 7, unitName: '㎏' }
		], {});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('product_units', null, {});
	}
};