const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'UsersTable'; // DynamoDB table name

exports.handler = async (event) => {
    try {
        // Scan the DynamoDB table to retrieve all users
        const params = {
            TableName: TABLE_NAME
        };

        const result = await dynamodb.scan(params).promise();

        // If no users found, return empty list
        if (!result.Items || result.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No users found', users: [] })
            };
        }

        // Return the list of users
        return {
            statusCode: 200,
            body: JSON.stringify({ users: result.Items })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
