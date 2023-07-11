'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES();

module.exports.sendEmail = async (event) => {
  try {
    for(let record of event.Records) {
      const { Source, email, verificationCode, message } = JSON.parse(record.body);

      let emailData;
      if (verificationCode) {
        // Verification code email
        emailData = {
          Charset: 'UTF-8',
          Data: `Your verification code is: ${verificationCode}`
        };
      } else if (message) {
        // Welcome email
        emailData = {
          Charset: 'UTF-8',
          Data: message
        };
      } else {
        throw new Error('No valid email data in SQS message');
      }

      // Send email
      const sesParams = {
        Source,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Text: emailData,
          },
          Subject: {
            Charset: 'UTF-8',
            Data: verificationCode ? 'Signup Verification Code' : 'Welcome Email',
          },
        },
      };

      await ses.sendEmail(sesParams).promise();
    }

  } catch (error) {
    console.error('Error processing SQS message', error);
  }
};
