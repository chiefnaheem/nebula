import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/response";
import { validateRequest, scoreSchema } from "../utils/validation";
import { logger } from "../utils/logger";
import { ScoreRequest } from "../types";
import { ScoreService } from "../services/score.service";
import { AuthService } from "../services/auth.service";

const scoreService = new ScoreService();
const authService = new AuthService();

export const submitHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract token from Authorization header
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return ResponseBuilder.error("Authorization header is required", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const user = await authService.verifyToken(token);

    if (!event.body) {
      return ResponseBuilder.error("Request body is required", 400);
    }

    const requestData = JSON.parse(event.body);
    const { score } = validateRequest<ScoreRequest>(scoreSchema, requestData);

    const scoreEntry = await scoreService.submitScore(user, score);

    return ResponseBuilder.success(scoreEntry, 201);
  } catch (error) {
    logger.error("Score submission handler error", error);

    if (error instanceof Error) {
      return ResponseBuilder.error(error.message, 400);
    }

    return ResponseBuilder.error("Internal server error", 500);
  }
};
