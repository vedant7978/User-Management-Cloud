const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'UsersTable'; // DynamoDB table name

exports.handler = async (event) => {
    try {
        // const { userId, name, email } = JSON.parse(event.body);
        
        const { userId, name, email } = event;

        const params = {
            TableName: TABLE_NAME,
            Key: { UserID: userId },
            UpdateExpression: 'SET #name = :name, Email = :email',
            ExpressionAttributeNames: { '#name': 'Name' },
            ExpressionAttributeValues: { ':name': name, ':email': email }
        };

        await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User updated successfully!' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
