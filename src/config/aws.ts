import AWS from "aws-sdk";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.CONNECTION_URL,
});

export const cognitoIdentityServiceProvider =
  new AWS.CognitoIdentityServiceProvider();
