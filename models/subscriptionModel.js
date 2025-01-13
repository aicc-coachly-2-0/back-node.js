const { postgreSQL } = require("../config/database");

exports.findAllSubacription = async () => {
  const query = `
          SELECT * FROM subscriptions;
      `;
  const { rows } = await postgreSQL.query(query);
  return rows;
};
// Insert a subscription into the database
exports.createSubscription = async (data) => {
  const createAt = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(createAt.getDate() + 30); // 30일 후로 설정
  const query = `
    INSERT INTO subscriptions (
      user_number,
      subscription_id,
      receipt_id,
      billing_key,
      expiration_date,
      state
    ) VALUES ($1, $2, $3, $4, $5,'active')
    RETURNING *;
  `;

  const values = [
    data.user_number,
    data.subscription_id,
    data.receipt_id,
    data.billing_key, // 구독 생성 시간
    expirationDate, // 구독 만료 시간
  ];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// Get all subscriptions for a user
exports.getSubscriptionsByUser = async (user_number) => {
  const query =
    "SELECT user_number, billing_key FROM subscriptions WHERE user_number = $1";
  const values = [user_number];
  const { rows } = await postgreSQL.query(query, values);

  console.log(rows); // 반환된 rows 배열을 로그로 확인

  return rows; // 반환된 값이 배열인지 확인
};

// Get all subscriptions for a user
exports.getSubscriptions = async (user_number) => {
  const query = "SELECT * FROM subscriptions WHERE user_number = $1";
  const values = [user_number];
  const { rows } = await postgreSQL.query(query, values);
  return rows;
};

// Delete a subscription by ID
exports.deleteSubscription = async (subscription_id) => {
  const query =
    "DELETE FROM subscriptions WHERE subscription_id = $1 RETURNING *";
  const values = [subscription_id];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.updateSubscription = async () => {
  const schedule = require("node-schedule");

  // 매일 자정에 실행되는 스케줄러
  schedule.scheduleJob("0 0 * * *", async () => {
    console.log("Checking subscriptions for expiration...");

    const query = `
      UPDATE subscriptions
      SET state = 'cancelled'
      WHERE expiration_date < CURRENT_TIMESTAMP
        AND state = 'active';
    `;

    try {
      const { rowCount } = await postgreSQL.query(query);
      console.log(`Updated ${rowCount} subscriptions to cancelled.`);
    } catch (error) {
      console.error("Error updating subscriptions:", error);
    }
  });

  console.log("Subscription state update job scheduled.");
};

exports.checkSubscriptionStatus = async (req, res) => {
  const { user_number } = req.params;

  const query = `
    SELECT state, expiration_date
    FROM subscriptions
    WHERE user_number = $1
      AND state = 'active';
  `;

  try {
    const { rows } = await postgreSQL.query(query, [user_number]);

    if (rows.length > 0) {
      res.status(200).json({ success: true, state: rows[0].state });
    } else {
      res.status(403).json({
        success: false,
        message: "Subscription is cancle or expired.",
      });
    }
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check subscription status.",
    });
  }
};

// 구독 상태 변경 (구독 취소)
// 구독 상태 변경 (구독 취소) 서비스
exports.cancelSubscription = async (user_number, subscription_id) => {
  try {
    // 구독 상태를 'cancelled'로 변경
    const query = `
      UPDATE subscriptions 
      SET state = 'cancelled', expiration_date = CURRENT_DATE, billing_key = NULL
      WHERE user_number = $1 AND subscription_id = $2
      RETURNING *;
    `;
    const { rows } = await postgreSQL.query(query, [
      user_number,
      subscription_id,
    ]);

    if (rows.length === 0) {
      throw new Error("Subscription not found or already cancelled");
    }

    return {
      success: true,
      message: "Subscription cancelled successfully",
      subscription: rows[0],
    };
  } catch (error) {
    console.error("Error in cancelSubscription service:", error);
    throw new Error("Error in cancelSubscription service");
  }
};
