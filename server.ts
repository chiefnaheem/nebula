// server.ts
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { handler as authHandler } from "./dist/handlers/auth";
import { getHandler } from "./dist/handlers/leaderboard";

import { submitHandler } from "./dist/handlers/score";
import { getUserScoresHandler } from "./dist/handlers/userScores";
import { connectHandler, disconnectHandler } from "./dist/handlers/websocket";
import { expressToLambda, lambdaToExpress } from "./src/utils/expressAdapter";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Auth routes
app.post("/auth/:action", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  console.log(lambdaEvent, "lambadgdgdgdggdgd");
  const lambdaResponse = await authHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

// Leaderboard routes
app.get("/leaderboard", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  const lambdaResponse = await getHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

app.get("/userScores", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  const lambdaResponse = await getUserScoresHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

// Score routes
app.post("/scores", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  const lambdaResponse = await submitHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

// WebSocket routes (for API Gateway WebSocket emulation)
app.post("/ws/connect", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  const lambdaResponse = await connectHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

app.post("/ws/disconnect", async (req, res) => {
  const lambdaEvent = expressToLambda(req);
  const lambdaResponse = await disconnectHandler(lambdaEvent);
  lambdaToExpress(res, lambdaResponse);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
