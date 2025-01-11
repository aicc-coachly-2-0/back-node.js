const subscriptionService = require("../services/subscriptionService");
const { RestClient } = require("@bootpay/server-rest-client");
const axios = require("axios");
const database = require("../config/database");
const now = new Date();
const threeMinutesLater = new Date(now.getTime() + 3 * 60 * 1000); // 3분 (3 * 60 * 1000 밀리초)
const reserve_execute_at = threeMinutesLater.toISOString();

RestClient.setConfig(
  process.env.BOOTPAY_API_KEY,
  process.env.BOOTPAY_PRIVATE_KEY
);

// Get Access Token from Bootpay API
async function getAccessToken() {
  try {
    const response = await RestClient.getAccessToken();
    if (response.status === 200) {
      return response.data.token;
    } else {
      throw new Error("Failed to get access token");
    }
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

// Lookup Billing Key and Save Subscription
exports.lookupBillingKey = async (req, res) => {
  const { receipt_id, user_number } = req.body;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return res.status(500).send("Failed to get access token");
    }

    const response = await axios.get(
      `https://api.bootpay.co.kr/v2/subscribe/billing_key/${receipt_id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 200) {
      const { subscription_id, billing_key } = response.data;
      const subscription = await subscriptionService.createSubscription({
        user_number,
        subscription_id,
        receipt_id,
        billing_key,
      });

      res.status(200).json({
        message: "Billing Key 조회 및 저장 성공",
        data: subscription,
      });
    } else {
      res.status(400).json({ error: "Billing Key 조회 실패" });
    }
  } catch (error) {
    console.error("오류 발생:", error.message);
    res.status(500).send("Error communicating with Bootpay server");
  }
};

exports.getAllSubscription = async (req, res, next) => {
  try {
    const users = await subscriptionService.getAllSubscription();
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    next(error);
  }
};
// Get all subscriptions for a user
exports.getSubscriptionsByUser = async (req, res) => {
  const { user_number } = req.params;

  try {
    const subscriptions = await subscriptionService.getSubscriptionsByUser(
      user_number
    );

    // subscriptions가 배열인지 확인
    if (!Array.isArray(subscriptions)) {
      return res
        .status(500)
        .json({ error: "구독 정보 조회 실패: 예상된 배열이 아닙니다." });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ error: "구독 정보가 없습니다." });
    }

    // billing_key가 있는 첫 번째 항목을 찾음
    const subscriptionWithBillingKey = subscriptions.find(
      (sub) => sub.billing_key
    );

    if (subscriptionWithBillingKey) {
      res
        .status(200)
        .json({ billing_key: subscriptionWithBillingKey.billing_key });
    } else {
      res.status(200).json({ billing_key: null });
    }
  } catch (error) {
    console.error("구독 정보 조회 실패:", error.message);
    res.status(500).json({ error: "구독 정보 조회에 실패했습니다." });
  }
};

exports.getSubscriptions = async (req, res) => {
  const { user_number } = req.params;

  try {
    const subscriptions = await subscriptionService.getSubscriptions(
      user_number
    );
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("구독 정보 조회 실패:", error.message);
    res.status(500).json({ error: "구독 정보 조회에 실패했습니다." });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  const { subscription_id } = req.params;

  try {
    const deletedSubscription = await subscriptionService.deleteSubscription(
      subscription_id
    );
    res.status(200).json({
      message: "구독 삭제 성공",
      data: deletedSubscription,
    });
  } catch (error) {
    console.error("구독 삭제 실패:", error.message);
    res.status(404).json({ error: "구독 삭제에 실패했습니다." });
  }
};

// 구독 상태 변경 요청 (구독 취소)
exports.updateSubscriptionState = async (req, res) => {
  const { subscription_number } = req.body;

  if (!subscription_number) {
    return res
      .status(400)
      .json({ success: false, message: "Subscription ID is required" });
  }

  try {
    // 서비스 호출하여 구독 취소 처리
    const result = await subscriptionService.cancelSubscription(
      subscription_number
    );

    if (result.success) {
      return res.status(200).json(result); // 구독 취소 성공
    } else {
      return res.status(404).json(result); // 구독이 없거나 이미 취소됨
    }
  } catch (error) {
    console.error("Error in subscriptionController:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { user_number, subscription_id } = req.body; // 요청에서 구독 번호를 가져옵니다.

  try {
    // 서비스에서 취소 처리 로직을 실행합니다.
    const result = await subscriptionService.cancelSubscription(
      user_number,
      subscription_id
    );

    // 성공적으로 취소되면, 200 상태 코드와 함께 메시지와 구독 정보를 반환합니다.
    res.status(200).json({
      message: result.message,
      subscription: result.subscription,
    });
  } catch (error) {
    // 오류가 발생하면, 500 상태 코드와 함께 오류 메시지를 반환합니다.
    res.status(500).json({
      error: error.message,
    });
  }
};
