import { v4 as uuidv4 } from "uuid";
import { dynamoDb } from "../config/aws";
import { ScoreEntry, User } from "../types";
import { logger } from "../utils/logger";
import { WebSocketService } from "./websocket.service";

export class ScoreService {
  private tableName = process.env.DYNAMODB_TABLE || "leaderboard";
  private websocketService = new WebSocketService();

  async submitScore(user: User, score: number): Promise<ScoreEntry> {
    try {
      const scoreEntry: ScoreEntry = {
        id: uuidv4(),
        user_id: user.id,
        user_name: user.preferred_username || user.name,
        score,
        timestamp: Date.now(),
      };

      const params = {
        TableName: this.tableName,
        Item: scoreEntry,
      };

      await dynamoDb.put(params).promise();

      logger.info("Score submitted successfully", {
        userId: user.id,
        score,
        scoreId: scoreEntry.id,
      });

      // Send notification if score > 1000
      if (score > 1000) {
        await this.websocketService.notifyHighScore(scoreEntry);
      }

      return scoreEntry;
    } catch (error) {
      logger.error("Score submission failed", {
        userId: user.id,
        score,
        error,
      });
      throw error;
    }
  }

  async getTopScores(limit: number = 10): Promise<ScoreEntry[]> {
    try {
      const params = {
        TableName: this.tableName,
        ScanIndexForward: false, // Descending order
        Limit: limit,
      };

      const result = await dynamoDb.scan(params).promise();

      const scores = (result.Items as ScoreEntry[]) || [];

      const sortedScores = scores
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.timestamp - b.timestamp;
        })
        .slice(0, limit);

      logger.info("Retrieved top scores", { count: sortedScores.length });

      return sortedScores;
    } catch (error) {
      logger.error("Failed to retrieve top scores", error);
      throw error;
    }
  }

  async getUserScores(userId: string): Promise<ScoreEntry[]> {
    try {
      const params = {
        TableName: this.tableName,
        FilterExpression: "user_id = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };

      const result = await dynamoDb.scan(params).promise();
      const scores = (result.Items as ScoreEntry[]) || [];

      return scores.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error("Failed to retrieve user scores", { userId, error });
      throw error;
    }
  }
}
