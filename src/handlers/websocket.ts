import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseBuilder } from "../utils/response";
import { logger } from "../utils/logger";
import { WebSocketService } from "../services/websocket.service";

const websocketService = new WebSocketService();

export const connectHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId!;
    await websocketService.handleConnect(connectionId);

    return ResponseBuilder.success({ message: "Connected" });
  } catch (error) {
    logger.error("WebSocket connect handler error", error);
    return ResponseBuilder.error("Connection failed", 500);
  }
};

export const disconnectHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId!;
    await websocketService.handleDisconnect(connectionId);

    return ResponseBuilder.success({ message: "Disconnected" });
  } catch (error) {
    logger.error("WebSocket disconnect handler error", error);
    return ResponseBuilder.error("Disconnection failed", 500);
  }
};
