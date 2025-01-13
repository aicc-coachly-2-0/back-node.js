const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const router = express.Router();

// Route for looking up billing key
router.post("/lookup-billingkey", subscriptionController.lookupBillingKey);
// router.post('/reserve-payment', subscriptionController.reservePayment);
router.post("/cancel_subscription", subscriptionController.cancelSubscription);
// 구독 상태 업데이트 (만료된 구독 비활성화)
// router.post("/update-expired", subscriptionController.updateExpiredSubscriptions);

// // 특정 구독 상태 변경
// router.post("/change-state", subscriptionController.changeSubscriptionState);

// // 특정 사용자의 구독 조회
// router.get("/user/:userNumber", subscriptionController.getUserSubscriptions);

router.get("/AllSubscription", subscriptionController.getAllSubscription);
router.get("/:user_number", subscriptionController.getSubscriptionsByUser);
router.get("/list/:user_number", subscriptionController.getSubscriptions);

// Delete a Subscription
router.delete("/:subscription_id", subscriptionController.deleteSubscription);

module.exports = router;
