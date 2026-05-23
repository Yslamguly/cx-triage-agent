#!/bin/bash
set -euo pipefail

echo "📦 Building TypeScript..."
npm run build

echo "🚀 Deploying to AWS..."
sam build
sam deploy \
  --guided \
  --stack-name cx-triage-agent \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "LLMProvider=${LLM_PROVIDER:-groq}" \
    "LLMApiKey=${LLM_API_KEY:?Set LLM_API_KEY env var}"

echo "✅ Deploy complete!"
