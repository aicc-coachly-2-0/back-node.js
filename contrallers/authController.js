const { createUserInDB, updateUserInDB } = require("../models/authModel");

async function createUser(userNumber) {
    const defaultUserData = {
        user_number: userNumber,
        liked_posts: [],
        liked_feeds: [],
        liked_post_comments: [],
        liked_feed_comments: [],
        following_users: [],
        followers: [],
        blocked_users: [],
        mission_points: [],
        total_points: 0,
        profile_picture: "",
        nickname: "",
        bio: "",
        profile_picture_updated_at: null,
        nickname_updated_at: null,
        bio_updated_at: null
    };

    try {
        await createUserInDB(defaultUserData);
        console.log(`User ${userNumber} created successfully!`);
    } catch (err) {
        console.error(err.message);
    }
}

async function updateUserProfile(userNumber, updates) {
    const updateFields = {};
    const now = new Date();

    if (updates.profile_picture !== undefined) {
        updateFields.profile_picture = updates.profile_picture;
        updateFields.profile_picture_updated_at = now;
    }
    if (updates.nickname !== undefined) {
        updateFields.nickname = updates.nickname;
        updateFields.nickname_updated_at = now;
    }
    if (updates.bio !== undefined) {
        updateFields.bio = updates.bio;
        updateFields.bio_updated_at = now;
    }

    try {
        await updateUserInDB(userNumber, updateFields);
        console.log(`User ${userNumber}'s profile updated successfully!`);
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = { createUser, updateUserProfile };
