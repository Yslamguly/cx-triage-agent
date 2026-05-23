import "./env";
import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chat";
import {LLM_PROVIDER} from "./config";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", provider: LLM_PROVIDER });
});

export const handler = serverless(app);