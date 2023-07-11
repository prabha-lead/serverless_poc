'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

module.exports.signUpUser = async (event) => {
  try {
    const { name, email, password } = JSON.parse(event.body);

    // Generate a unique user ID
    const userId = Math.random().toString(36).substring(2, 15);

    // Generate a verification code
    const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    // Create a new user record in DynamoDB
    const params = {
      TableName: 'users',
      Item: {
        userId,
        name,
        email,
        password,
        isWelcomeSend: false,
        verificationCode,  // Store verification code
      },
    };

    await dynamoDB.put(params).promise();

    // Send message to SQS
    const sqsParams = {
      MessageBody: JSON.stringify({
        Source: process.env.SOURCE_EMAIL,
        email,
        verificationCode
      }),
      QueueUrl: process.env.SQS_QUEUE_URL
    };

    await sqs.sendMessage(sqsParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User signed up successfully! A verification code has been sent to your email.',
        userId,
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
