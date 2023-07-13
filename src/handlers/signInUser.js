'use strict';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// Initialize Cognito User Pool
const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_CLIENT_ID
});

module.exports.signInUser = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    
    const authenticationData = {
      Username: email,
      Password: password
    };
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  
    const userData = {
      Username: email,
      Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const accessToken = result.getAccessToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
  
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              message: 'User signed in successfully.',
              accessToken,
              refreshToken
            }),
          });
        },
        onFailure: (err) => {
          console.log('Error signing in:', err);
          reject(new Error(`An error occurred while signing in the user. Error: ${err}`));
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log('New password required');
          reject(new Error('New password required.'));
        }
      });
    });
  } catch (error) {
    console.log('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing request.',
        error: error.message
      })
    };
  }
};
