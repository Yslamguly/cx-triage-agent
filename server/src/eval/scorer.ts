import { TestCase } from "./testCases";
import { OrchestratorResult } from "../orchestrator";

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  toolScore: number;
  handoffCorrect: boolean;
  toolsUsed: string[];
  expectedTools: string[];
  reply: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  errors: string[];
}

export function scoreResult(
  testCase: TestCase,
  result: OrchestratorResult,
  latencyMs: number
): TestResult {
  const errors: string[] = [];

  // ── Tool selection scoring ──
  // Deduplicate: we don't care if a tool was called twice
  const actualTools = [...new Set(result.toolsUsed)];
  const expectedTools = [...new Set(testCase.expectedTools)];

  // For edge cases (no tools expected), check that no tools were called
  let toolScore: number;
  if (expectedTools.length === 0) {
    toolScore = actualTools.length === 0 ? 1 : 0;
    if (actualTools.length > 0) {
      errors.push(`Expected no tools, but got: ${actualTools.join(", ")}`);
    }
  } else {
    // Recall: how many expected tools were actually called?
    const hits = expectedTools.filter((t) => actualTools.includes(t)).length;
    const recall = hits / expectedTools.length;

    // Precision: of the tools called, how many were expected?
    const precision =
      actualTools.length > 0
        ? actualTools.filter((t) => expectedTools.includes(t)).length /
          actualTools.length
        : 0;

    // F1 score (harmonic mean of precision and recall)
    toolScore =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    const missed = expectedTools.filter((t) => !actualTools.includes(t));
    const extra = actualTools.filter((t) => !expectedTools.includes(t));
    if (missed.length > 0) errors.push(`Missing tools: ${missed.join(", ")}`);
    if (extra.length > 0) errors.push(`Unexpected tools: ${extra.join(", ")}`);
  }

  // ── Handoff scoring ──
  const actualHandoff = result.handoff !== null;
  const handoffCorrect = actualHandoff === testCase.expectedHandoff;
  if (!handoffCorrect) {
    errors.push(
      testCase.expectedHandoff
        ? "Expected handoff but agent did not escalate"
        : "Agent escalated unexpectedly"
    );
  }

  // ── Overall pass: tools ≥ 0.5 AND handoff correct ──
  const passed = toolScore >= 0.5 && handoffCorrect;

  return {
    testCase,
    passed,
    toolScore,
    handoffCorrect,
    toolsUsed: actualTools,
    expectedTools,
    reply: result.reply.substring(0, 200),
    latencyMs,
    inputTokens: result.totalInputTokens,
    outputTokens: result.totalOutputTokens,
    errors,
  };
}
