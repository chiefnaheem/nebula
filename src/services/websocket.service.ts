import { apiGateway } from "../config/aws";
import { ScoreEntry, WebSocketMessage } from "../types";
import { logger } from "../utils/logger";

export class WebSocketService {
  private activeConnections = new Set<string>();

  private async getActiveConnections(): Promise<string[]> {
    return Array.from(this.activeConnections);
  }
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
      const connectionIds = await this.getActiveConnections();
      console.log(connectionIds, "connectionsiddss");

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

  // private async getActiveConnections(): Promise<string[]> {
  //   return [];
  // }

  private async removeConnection(connectionId: string): Promise<void> {
    logger.info("Connection removed", { connectionId });
  }

  async handleConnect(connectionId: string): Promise<void> {
    this.activeConnections.add(connectionId);
    logger.info("Connection stored in memory", { connectionId });
  }

  async handleDisconnect(connectionId: string): Promise<void> {
    try {
      await this.removeConnection(connectionId);
      logger.info("WebSocket connection closed", { connectionId });
    } catch (error) {
      logger.error("Failed to handle disconnection", { connectionId, error });
    }
  }
}
