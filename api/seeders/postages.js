'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert(
      "postages",
      [
        {
          "shop_code": "1000",
          "pref_code": "01",
          "shipping_flg": 0,
          "size_code": "S",
          "shipping_fee": 1460,
        },
        {
          "shop_code": "1000",
          "pref_code": "02",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 1060,
        },
        {
          "shop_code": "1000",
          "pref_code": "03",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 1060,
        },
        {
          "shop_code": "1000",
          "pref_code": "04",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },
        {
          "shop_code": "1000",
          "pref_code": "05",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 1060,
        },
        {
          "shop_code": "1000",
          "pref_code": "06",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },        {
          "shop_code": "1000",
          "pref_code": "07",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },        {
          "shop_code": "1000",
          "pref_code": "08",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },        {
          "shop_code": "1000",
          "pref_code": "09",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },
        {
          "shop_code": "1000",
          "pref_code": "10",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 940,
        },
        {
          "shop_code": "1000",
          "pref_code": "35",
          "shipping_flg": 1,
          "size_code": "S",
          "shipping_fee": 1190,
        },        {
          "shop_code": "1000",
          "pref_code": "01",
          "shipping_flg": 0,
          "size_code": "M",
          "shipping_fee": 2050,
        },
        {
          "shop_code": "1000",
          "pref_code": "02",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1650,
        },
        {
          "shop_code": "1000",
          "pref_code": "03",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1650,
        },
        {
          "shop_code": "1000",
          "pref_code": "04",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },
        {
          "shop_code": "1000",
          "pref_code": "05",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1650,
        },
        {
          "shop_code": "1000",
          "pref_code": "06",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },        {
          "shop_code": "1000",
          "pref_code": "07",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },        {
          "shop_code": "1000",
          "pref_code": "08",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },        {
          "shop_code": "1000",
          "pref_code": "09",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },
        {
          "shop_code": "1000",
          "pref_code": "10",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1530,
        },
        {
          "shop_code": "1000",
          "pref_code": "35",
          "shipping_flg": 1,
          "size_code": "M",
          "shipping_fee": 1790,
        },
        {
          "shop_code": "1000",
          "pref_code": "01",
          "shipping_flg": 0,
          "size_code": "L",
          "shipping_fee": 2710,
        },
        {
          "shop_code": "1000",
          "pref_code": "02",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2190,
        },
        {
          "shop_code": "1000",
          "pref_code": "03",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2310,
        },
        {
          "shop_code": "1000",
          "pref_code": "04",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2310,
        },
        {
          "shop_code": "1000",
          "pref_code": "05",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2190,
        },
        {
          "shop_code": "1000",
          "pref_code": "06",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2310,
        },        {
          "shop_code": "1000",
          "pref_code": "07",
          "shipping_flg": 1,
        "size_code": "L",
          "shipping_fee": 2310,
        },        {
          "shop_code": "1000",
          "pref_code": "08",
          "shipping_flg": 1,
        "size_code": "L",
          "shipping_fee": 2310,
        },        {
          "shop_code": "1000",
          "pref_code": "09",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2310,
        },
        {
          "shop_code": "1000",
          "pref_code": "10",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2310,
        },
        {
          "shop_code": "1000",
          "pref_code": "35",
          "shipping_flg": 1,
          "size_code": "L",
          "shipping_fee": 2450,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("postages", null, {});
  }
};
