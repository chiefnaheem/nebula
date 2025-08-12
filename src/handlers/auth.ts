import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/response";
import { validateRequest, authSchema, loginSchema } from "../utils/validation";
import { logger } from "../utils/logger";
import { AuthRequest } from "../types";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const action = event.pathParameters?.action;

    if (!event.body) {
      return ResponseBuilder.error("Request body is required", 400);
    }

    const requestData = JSON.parse(event.body);

    switch (action) {
      case "register": {
        const authRequest = validateRequest<AuthRequest>(
          authSchema,
          requestData
        );
        const result = await authService.register(authRequest);
        return ResponseBuilder.success(result, 201);
      }

      case "login": {
        console.log("Login action triggered", requestData);
        const authRequest = validateRequest<AuthRequest>(
          loginSchema,
          requestData
        );
        const result = await authService.login(authRequest);
        return ResponseBuilder.success(result);
      }

      default:
        return ResponseBuilder.error("Invalid action", 400);
    }
  } catch (error) {
    logger.error("Auth handler error", error);

    if (error instanceof Error) {
      return ResponseBuilder.error(error.message, 400);
    }

    return ResponseBuilder.error("Internal server error", 500);
  }
};
