const { MongoClient } = require("mongodb");

// MongoDB 연결 설정
const uri = "mongodb://localhost:27020";
const client = new MongoClient(uri);

async function createUserInDB(userData) {
    try {
        await client.connect();
        const db = client.db("my_database");
        const usersCollection = db.collection("users");

        await usersCollection.insertOne(userData);
    } catch (err) {
        throw new Error("Error creating user in database: " + err.message);
    } finally {
        await client.close();
    }
}

async function updateUserInDB(userNumber, updateFields) {
    try {
        await client.connect();
        const db = client.db("my_database");
        const usersCollection = db.collection("users");

        await usersCollection.updateOne(
            { user_number: userNumber },
            { $set: updateFields }
        );
    } catch (err) {
        throw new Error("Error updating user in database: " + err.message);
    } finally {
        await client.close();
    }
}

module.exports = { createUserInDB, updateUserInDB };
