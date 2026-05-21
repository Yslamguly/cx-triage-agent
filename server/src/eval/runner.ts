import "../env";
import { createProvider } from "../providers";
import { runOrchestrator } from "../orchestrator";
import { testCases } from "./testCases";
import { scoreResult, TestResult } from "./scorer";
import { Message } from "../types";

async function runEval() {
  const provider = createProvider();
  const providerName = process.env.LLM_PROVIDER || "openai";
  const results: TestResult[] = [];

  console.log(`\n🧪 CX Triage Agent — Evaluation Harness`);
  console.log(`   Provider: ${providerName}`);
  console.log(`   Test cases: ${testCases.length}`);
  console.log(`${"─".repeat(60)}\n`);

  for (const testCase of testCases) {
    process.stdout.write(`  Running [${testCase.id}] ${testCase.description}... `);

    const messages: Message[] = [
      { role: "user", content: testCase.userMessage },
    ];

    const startTime = Date.now();
    try {
      const { result } = await runOrchestrator(provider, messages);
      const latencyMs = Date.now() - startTime;
      const scored = scoreResult(testCase, result, latencyMs);
      results.push(scored);

      console.log(scored.passed ? "✅ PASS" : "❌ FAIL");
      if (scored.errors.length > 0) {
        scored.errors.forEach((e) => console.log(`     ⚠ ${e}`));
      }
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      console.log("💥 ERROR");
      console.log(`     ${err instanceof Error ? err.message : err}`);
      results.push({
        testCase,
        passed: false,
        toolScore: 0,
        handoffCorrect: false,
        toolsUsed: [],
        expectedTools: testCase.expectedTools,
        reply: "",
        latencyMs,
        inputTokens: 0,
        outputTokens: 0,
        errors: [err instanceof Error ? err.message : "Unknown error"],
      });
    }

    // Rate limit buffer between requests
    await sleep(1000);
  }

  printReport(results, providerName);
}

function printReport(results: TestResult[], provider: string) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  EVALUATION REPORT — ${provider}`);
  console.log(`${"═".repeat(60)}\n`);

  // ── Per-case results table ──
  console.log(
    `  ${"ID".padEnd(14)} ${"Category".padEnd(16)} ${"Tools".padEnd(7)} ${"Handoff".padEnd(9)} ${"Status".padEnd(8)} ${"Latency".padEnd(10)} Tokens`
  );
  console.log(`  ${"-".repeat(72)}`);

  for (const r of results) {
    const toolPct = `${Math.round(r.toolScore * 100)}%`;
    const handoff = r.handoffCorrect ? "✓" : "✗";
    const status = r.passed ? "PASS" : "FAIL";
    const latency = `${r.latencyMs}ms`;
    const tokens = `${r.inputTokens + r.outputTokens}`;

    console.log(
      `  ${r.testCase.id.padEnd(14)} ${r.testCase.category.padEnd(16)} ${toolPct.padEnd(7)} ${handoff.padEnd(9)} ${status.padEnd(8)} ${latency.padEnd(10)} ${tokens}`
    );
  }

  // ── Aggregate stats ──
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const passRate = ((passed / total) * 100).toFixed(1);

  const avgToolScore = (
    results.reduce((s, r) => s + r.toolScore, 0) / total
  ).toFixed(2);

  const handoffCorrect = results.filter((r) => r.handoffCorrect).length;
  const handoffRate = ((handoffCorrect / total) * 100).toFixed(1);

  const avgLatency = Math.round(
    results.reduce((s, r) => s + r.latencyMs, 0) / total
  );

  const totalInputTokens = results.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutputTokens = results.reduce((s, r) => s + r.outputTokens, 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  console.log(`\n  ${"─".repeat(72)}`);
  console.log(`\n  📊 Summary`);
  console.log(`     Pass rate:        ${passed}/${total} (${passRate}%)`);
  console.log(`     Avg tool score:   ${avgToolScore}`);
  console.log(`     Handoff accuracy: ${handoffCorrect}/${total} (${handoffRate}%)`);
  console.log(`     Avg latency:      ${avgLatency}ms`);
  console.log(`     Total tokens:     ${totalTokens} (in: ${totalInputTokens}, out: ${totalOutputTokens})`);

  // ── Category breakdown ──
  const categories = [...new Set(results.map((r) => r.testCase.category))];
  console.log(`\n  📁 By Category`);
  for (const cat of categories) {
    const catResults = results.filter((r) => r.testCase.category === cat);
    const catPassed = catResults.filter((r) => r.passed).length;
    console.log(
      `     ${cat.padEnd(18)} ${catPassed}/${catResults.length} passed`
    );
  }

  // ── Failed cases ──
  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log(`\n  ❌ Failed Cases`);
    for (const r of failed) {
      console.log(`     [${r.testCase.id}] ${r.testCase.description}`);
      console.log(`       Tools used: ${r.toolsUsed.join(", ") || "(none)"}`);
      console.log(`       Expected:   ${r.expectedTools.join(", ") || "(none)"}`);
      r.errors.forEach((e) => console.log(`       Error: ${e}`));
    }
  }

  console.log(`\n${"═".repeat(60)}\n`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runEval().catch(console.error);
