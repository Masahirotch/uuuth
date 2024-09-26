const Joi = require('joi');
const models = require("../models")

function validateShopId(user, helpers) {
  if (user.shopId !== user.shop.shopId) {
    return helpers.message({
      custom: `user.shopId and shop.shopId is not the same`,
    });
  }
  return user;
}

function validateAddressId(user, helpers) {
  if (user.shop.addressId !== user.shop.address.addressId) {
    return helpers.message({
      custom: `user.shop.addressId and user.shop.address.addressId is not the same`,
    });
  }
  return user;
}

function validateShopGroupId(user, helpers) {
  if (user.shop.shop_group && user.shop.shopGroupId !== user.shop.shop_group.shopGroupId) {
    return helpers.message({
      custom: `user.shop.shopGroupId and user.shop.shop_group.shopGroupId is not the same`,
    });
  }
  return user;
}

module.exports = Joi.object({
  token: Joi.string().required(),
  user: Joi.object({
    userId: Joi.number(),
    isParent: Joi.valid(0, 1, true, false),
    userCode: Joi.string().max(20).required(),
    userLine: Joi.string().max(128).optional().allow(null, ''),
    userName: Joi.string().max(255).required(),
    shopId: Joi.number(),
    salesChannel: Joi.array().items(Joi.number()).required(),
    userTel: Joi.string().max(16).optional().allow(null, ''),
    regist: Joi.valid(0, 1, true, false),
    active: Joi.valid(0, 1, true, false),
    purchase: Joi.valid(0, 1, true, false),
    tag: Joi.string().pattern(/^\[[\d|,]*\]$/).optional().allow(null, '[]'),
    shop: Joi.object({
      shopId: Joi.optional().allow(null, ''),
      shopCode: Joi.string().max(20).required(),
      shopName: Joi.string().max(255).required(),
      bizName: Joi.string().max(255).required(),
      shopGroupId: Joi.number().optional().allow(null, ''),
      addressId: Joi.optional().allow(null, ''),
      shopReceiver: Joi.string().max(128).optional().allow(null, ''),
      shopPickup: Joi.valid(0, 1, true, false),
      closing: Joi.string().pattern(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/),
      address: Joi.object({
        addressId: Joi.number().optional().allow(null, ''),
        zip: Joi.string().max(7).required(),
        prefCode: Joi.number().optional().allow(null, ''),
        perf: Joi.string().max(32).optional().allow(null, ''),
        city: Joi.string().max(255).required(),
        street: Joi.string().max(255).required(),
        address: Joi.string().max(255).required(),
        addition: Joi.string().max(255).optional().allow(null, ''),
        tel1: Joi.string().max(5).optional().allow(null, ''),
        tel2: Joi.string().max(5).optional().allow(null, ''),
        tel3: Joi.string().max(4).optional().allow(null, ''),
        name: Joi.string().max(255).required(),
      }).required(),
      shop_group: Joi.allow({
        shopGroupId: Joi.number().optional().allow(null, ''),
        groupName: Joi.string().required().allow(null, ''),
      }).required().allow(null, ''),
    }).required(),
  }).required()
    .custom(validateShopId)
    .custom(validateAddressId)
    .custom(validateShopGroupId),
})