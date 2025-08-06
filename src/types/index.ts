export interface User {
  id: string;
  email: string;
  preferred_username: string;
  name: string;
}

export interface ScoreEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
  preferred_username?: string;
}

export interface ScoreRequest {
  score: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export interface WebSocketMessage {
  action: string;
  data: any;
}
