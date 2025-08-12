// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import { authHandler } from "../dist/handlers/auth";
// import { getHandler } from "../dist/handlers/leaderboard";
// import { submitHandler } from "../dist/handlers/score";

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(bodyParser.json());

// // Map Lambda handlers to Express routes
// app.post("/auth/:action", async (req, res) => {
//   const result = await authHandler({
//     pathParameters: req.params,
//     body: JSON.stringify(req.body),
//     headers: req.headers,
//   } as any);

//   res.status(result.statusCode).json(JSON.parse(result.body));
// });

// app.get("/leaderboard", async (req, res) => {
//   const result = await getHandler({
//     queryStringParameters: req.query,
//     headers: req.headers,
//   } as any);

//   res.status(result.statusCode).json(JSON.parse(result.body));
// });

// app.post("/scores", async (req, res) => {
//   const result = await submitHandler({
//     headers: req.headers,
//     body: JSON.stringify(req.body),
//   } as any);

//   res.status(result.statusCode).json(JSON.parse(result.body));
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
