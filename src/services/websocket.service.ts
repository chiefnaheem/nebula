import { apiGateway } from "../config/aws";
import { ScoreEntry, WebSocketMessage } from "../types";
import { logger } from "../utils/logger";

export class WebSocketService {
  async notifyHighScore(scoreEntry: ScoreEntry): Promise<void> {
    try {
      const message: WebSocketMessage = {
        action: "HIGH_SCORE_ACHIEVED",
        data: {
          user_name: scoreEntry.user_name,
          score: scoreEntry.score,
          timestamp: scoreEntry.timestamp,
          message: `🎉 ${scoreEntry.user_name} achieved a high score of ${scoreEntry.score}!`,
        },
      };

      // In a real implementation, you'd maintain a list of connected clients
      // For this mock, we'll simulate sending to all connections
      await this.broadcastMessage(message);

      logger.info("High score notification sent", {
        userId: scoreEntry.user_id,
        score: scoreEntry.score,
      });
    } catch (error) {
      logger.error("Failed to send high score notification", error);
    }
  }

  private async broadcastMessage(message: WebSocketMessage): Promise<void> {
    try {
      // In production, you'd query DynamoDB for active connections
      // This is a simplified implementation
      const connectionIds = await this.getActiveConnections();

      const promises = connectionIds.map(async (connectionId) => {
        try {
          await apiGateway
            .postToConnection({
              ConnectionId: connectionId,
              Data: JSON.stringify(message),
            })
            .promise();
        } catch (error) {
          if ((error as any).statusCode === 410) {
            // Connection is stale, remove it
            await this.removeConnection(connectionId);
          }
          logger.warn("Failed to send message to connection", {
            connectionId,
            error,
          });
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      logger.error("Failed to broadcast message", error);
    }
  }

  private async getActiveConnections(): Promise<string[]> {
    // In production, you'd store connections in DynamoDB
    // This is a mock implementation
    return [];
  }

  private async removeConnection(connectionId: string): Promise<void> {
    // In production, you'd remove the connection from DynamoDB
    logger.info("Connection removed", { connectionId });
  }

  async handleConnect(connectionId: string): Promise<void> {
    try {
      // Store connection in DynamoDB
      logger.info("WebSocket connection established", { connectionId });
    } catch (error) {
      logger.error("Failed to handle connection", { connectionId, error });
    }
  }

  async handleDisconnect(connectionId: string): Promise<void> {
    try {
      // Remove connection from DynamoDB
      await this.removeConnection(connectionId);
      logger.info("WebSocket connection closed", { connectionId });
    } catch (error) {
      logger.error("Failed to handle disconnection", { connectionId, error });
    }
  }
}
