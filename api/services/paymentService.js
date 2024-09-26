const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const paymentService = {
  createPaymentIntents: async (req, res, next) => {
    try {
      console.log(req.body);
      const amount = req.body.amount;
      const currency = req.body.currency;

      const results = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: ["card"],
      });

      return res.json(results);
    } catch (err) {
      console.log(err);
      return res.json(err);
    }
  },
};

module.exports = paymentService;
