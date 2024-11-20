const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid').v4;

const BUCKET_NAME = 'user-images-bucket13777'; 
const TABLE_NAME = 'UsersTable'; // DynamoDB table name

exports.handler = async (event) => {
    try {
        // console.log(event);
        // console.log(JSON.parse(event.body));
        const {name, email, image } = event;
        // const {name, email, image } = JSON.parse(event.body);
        // JSON.parse(event.body); // Extract user data
        console.log(name);
        
        // Check if a user with the given email already exists in DynamoDB
       // Use scan to check if a user with the given email already exists (less efficient)
        const checkUserParams = {
            TableName: TABLE_NAME,
            FilterExpression: 'Email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };
        
        const userExists = await dynamodb.scan(checkUserParams).promise();

        if (userExists.Items.length > 0) {
            // If user already exists, return an error message
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User with this email already exists.' })
            };
        }
        const userId = uuid(); // Generate a unique user ID
        
        // Decode the base64 image and upload to S3
        const imageBuffer = Buffer.from(image, 'base64');
        const s3Params = {
            Bucket: BUCKET_NAME,
            Key: `${userId}.jpg`,
            Body: imageBuffer,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        await s3.putObject(s3Params).promise();

        const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${userId}.jpg`;

        // Store user details in DynamoDB
        const dynamoParams = {
            TableName: TABLE_NAME,
            Item: {
                UserID: userId,
                Name: name,
                Email: email,
                ImageURL: imageUrl
            }
        };
        await dynamodb.put(dynamoParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User created successfully!',userId: userId })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
