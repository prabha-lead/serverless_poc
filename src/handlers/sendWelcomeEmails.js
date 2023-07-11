'use strict';

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

module.exports.sendWelcomeEmails = async () => {
  try {
    // Get all users where isWelcomeSend is false
    const params = {
      TableName: 'users',
      FilterExpression: 'isWelcomeSend = :isWelcomeSend',
      ExpressionAttributeValues: { ':isWelcomeSend': false }
    };

    const result = await dynamoDB.scan(params).promise();

    for (let user of result.Items) {
      // Send message to SQS
      const sqsParams = {
        MessageBody: JSON.stringify({
          Source: process.env.SOURCE_EMAIL,
          email: user.email,
          // update this message to represent your welcome email content
          message: 'Welcome to our service!',
        }),
        QueueUrl: process.env.SQS_QUEUE_URL
      };

      await sqs.sendMessage(sqsParams).promise();

      // Update user isWelcomeSend to true
      const updateParams = {
        TableName: 'users',
        Key: { 'userId': user.userId },
        UpdateExpression: 'set isWelcomeSend = :isWelcomeSend',
        ExpressionAttributeValues: { ':isWelcomeSend': true }
      };

      await dynamoDB.update(updateParams).promise();
    }
  } catch (error) {
    console.error('Error processing welcome emails', error);
  }
};
