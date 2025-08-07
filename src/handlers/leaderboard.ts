import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/response";
import { logger } from "../utils/logger";
import { ScoreService } from "../services/score.service";

const scoreService = new ScoreService();

export const getHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 10;

    if (limit < 1 || limit > 100) {
      return ResponseBuilder.error("Limit must be between 1 and 100", 400);
    }

    const topScores = await scoreService.getTopScores(limit);

    return ResponseBuilder.success({
      scores: topScores,
      total: topScores.length,
      limit,
    });
  } catch (error) {
    logger.error("Leaderboard handler error", error);

    if (error instanceof Error) {
      return ResponseBuilder.error(error.message, 400);
    }

    return ResponseBuilder.error("Internal server error", 500);
  }
};
