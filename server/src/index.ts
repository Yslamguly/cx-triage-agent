import "./env";
import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chat";
import { PORT, LLM_PROVIDER } from "./config";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", provider: LLM_PROVIDER });
});

app.listen(PORT, () => {
  console.log(`CX Triage Agent server running on port ${PORT}`);
  console.log(`LLM Provider: ${LLM_PROVIDER}`);
});

export { app };
