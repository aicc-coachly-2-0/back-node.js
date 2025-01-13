const database = require("../config/database");
const subscriptionModel = require("../models/subscriptionModel");

exports.getAllSubscription = async () => {
  return await subscriptionModel.findAllSubacription();
};
// Create a new subscription
exports.createSubscription = async (data) => {
  return await subscriptionModel.createSubscription(data);
};

// Get all subscriptions for a user
exports.getSubscriptionsByUser = async (user_number) => {
  return await subscriptionModel.getSubscriptionsByUser(user_number);
};
exports.getSubscriptions = async (user_number) => {
  return await subscriptionModel.getSubscriptions(user_number);
};

exports.cancelSubscription = async (user_number, subscription_id) => {
  return await subscriptionModel.cancelSubscription(
    user_number,
    subscription_id
  );
};
exports.updateSubscriptionState = async (subscription_number) => {
  return await subscriptionModel.updateSubscriptionState(subscription_number);
};
// Delete a subscription
exports.deleteSubscription = async (subscription_id) => {
  const deletedSubscription = await subscriptionModel.deleteSubscription(
    subscription_id
  );
  if (!deletedSubscription) {
    throw new Error("Subscription not found");
  }
  return deletedSubscription;
};
