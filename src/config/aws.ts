import AWS from "aws-sdk";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIA474VTUGHK62Y2HHT",
  secretAccessKey:
    process.env.AWS_SECRET_ACCESS_KEY ||
    "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",
  region: process.env.AWS_REGION || "eu-north-1",
});

export const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const apiGateway = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.CONNECTION_URL,
});

export const cognitoIdentityServiceProvider =
  new AWS.CognitoIdentityServiceProvider();
