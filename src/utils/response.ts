import { ApiResponse } from "../types";

export class ResponseBuilder {
  static success<T>(data: T, statusCode: number = 200): ApiResponse<T> {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: true,
        data,
        timestamp: Date.now(),
      }),
    };
  }

  static error(
    message: string,
    statusCode: number = 400,
    details?: any
  ): ApiResponse {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        error: {
          message,
          details,
          timestamp: Date.now(),
        },
      }),
    };
  }
}
