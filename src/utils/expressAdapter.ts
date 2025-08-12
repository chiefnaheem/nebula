// src/utils/expressAdapter.ts
import { Request, Response } from "express";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export function expressToLambda(req: Request): APIGatewayProxyEvent {
  return {
    httpMethod: req.method,
    path: req.path,
    headers: req.headers as Record<string, string>,
    pathParameters: req.params,
    queryStringParameters: req.query as Record<string, string>,
    body: JSON.stringify(req.body),
    requestContext: {
      connectionId: req.headers["connection-id"] as string | undefined,
    },
    isBase64Encoded: false,
  } as APIGatewayProxyEvent;
}

export function lambdaToExpress(
  res: Response,
  lambdaResponse: APIGatewayProxyResult
) {
  if (lambdaResponse.headers) {
    Object.entries(lambdaResponse.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, String(value));
      }
    });
  }
  res.status(lambdaResponse.statusCode).send(JSON.parse(lambdaResponse.body));
}
