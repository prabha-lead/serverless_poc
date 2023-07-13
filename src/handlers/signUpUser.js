'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const s3 = new AWS.S3();

// Import Amazon Cognito Identity SDK
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// Initialize Cognito User Pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_CLIENT_ID
});

module.exports.signUpUser = async (event) => {
  try {
    const { name, email, password, image } = JSON.parse(event.body);

    // Generate a unique user ID
    const userId = Math.random().toString(36).substring(2, 15);

    // Generate a unique file name
    const fileName = `users/${userId}.jpg`;

    // Upload user image to S3
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(image, 'base64'), 
      ContentType: 'image/jpeg'
    };

    const uploadResponse = await s3.upload(uploadParams).promise();
    const imageUrl = uploadResponse.Location;

    // Sign up user to Cognito User Pool
    const attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email", Value: email}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name", Value: name}));

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      const cognitoUser = result.user;
      console.log('user name is ' + cognitoUser.getUsername());
    });

    // Create a new user record in DynamoDB
    const params = {
      TableName: 'users',
      Item: {
        userId,
        name,
        email,
        password,
        imageUrl,
        isWelcomeSend: false,
      },
    };

    await dynamoDB.put(params).promise();

    // Send message to SQS
    const sqsParams = {
      MessageBody: JSON.stringify({
        Source: process.env.SOURCE_EMAIL,
        email
      }),
      QueueUrl: process.env.SQS_QUEUE_URL
    };

    await sqs.sendMessage(sqsParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User signed up successfully! A verification code has been sent to your email.',
        userId,
        imageUrl,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An error occurred while signing up the user.',
        error,
      }),
    };
  }
};
