const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = 'user-images-bucket13777'; // S3 bucket name
const TABLE_NAME = 'UsersTable'; // DynamoDB table name

exports.handler = async (event) => {
    try {
        // const { userId } = JSON.parse(event.body);
        const { userId } = event;

        // Get user details to fetch the image URL
        const params = {
            TableName: TABLE_NAME,
            Key: { UserID: userId }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        const imageUrl = result.Item.ImageURL;
        const imageKey = imageUrl.split('/').pop(); // Get the file name from the URL

        // Delete the image from S3
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: imageKey }).promise();

        // Delete the user from DynamoDB
        await dynamodb.delete({ TableName: TABLE_NAME, Key: { UserID: userId } }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User deleted successfully!' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
