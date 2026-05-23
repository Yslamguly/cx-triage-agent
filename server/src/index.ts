import "./env";
import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chat";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", provider: process.env.LLM_PROVIDER || "openai" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CX Triage Agent server running on port ${PORT}`);
  console.log(`LLM Provider: ${process.env.LLM_PROVIDER || "groq"}`);
});

export { app };
