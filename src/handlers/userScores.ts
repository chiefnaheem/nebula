import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/response";
import { logger } from "../utils/logger";
import { AuthService } from "../services/auth.service";
import { ScoreService } from "../services/score.service";

const scoreService = new ScoreService();
const authService = new AuthService();

export const getUserScoresHandler = async (
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

    const scores = await scoreService.getUserScores(user.id);

    return ResponseBuilder.success({
      userId: user.id,
      scores,
      count: scores.length,
    });
  } catch (error) {
    logger.error("Failed to get user scores", error);

    if (error instanceof Error) {
      return ResponseBuilder.error(error.message, 400);
    }

    return ResponseBuilder.error("Internal server error", 500);
  }
};
