#!/bin/bash

# Lighthouse Summary Extractor
# Extracts only essential performance metrics from Lighthouse JSON reports
# Usage: ./scripts/lighthouse-summary.sh lighthouse.json

if [ -z "$1" ]; then
  echo "Usage: $0 <lighthouse-json-file>"
  echo "Example: $0 lighthouse.json"
  exit 1
fi

LIGHTHOUSE_FILE="$1"

if [ ! -f "$LIGHTHOUSE_FILE" ]; then
  echo "Error: File '$LIGHTHOUSE_FILE' not found"
  exit 1
fi

echo "=== LIGHTHOUSE PERFORMANCE SUMMARY ==="
echo ""

# Extract performance score
echo "📊 Overall Score:"
jq -r '.categories.performance.score * 100 | floor | "Performance: \(.)/100"' "$LIGHTHOUSE_FILE"
echo ""

# Extract core metrics
echo "⚡ Core Web Vitals:"
jq -r '
.audits |
{
  "FCP": .["first-contentful-paint"].displayValue,
  "LCP": .["largest-contentful-paint"].displayValue,
  "TBT": .["total-blocking-time"].displayValue,
  "CLS": .["cumulative-layout-shift"].displayValue,
  "SI": .["speed-index"].displayValue,
  "TTI": .["interactive"].displayValue
} |
to_entries[] |
"  \(.key): \(.value)"
' "$LIGHTHOUSE_FILE"
echo ""

# Extract top opportunities (savings > 100ms or size > 10kb)
echo "🎯 Top Optimization Opportunities:"
jq -r '
[.audits | to_entries[] |
  select(.value.details.overallSavingsMs? > 100 or .value.details.overallSavingsBytes? > 10240) |
  {
    title: .value.title,
    savings_ms: .value.details.overallSavingsMs,
    savings_kb: (.value.details.overallSavingsBytes / 1024 | floor)
  }
] |
sort_by(-.savings_ms // -.savings_kb) |
.[:5] |
to_entries[] |
if .value.savings_ms then
  "  \(.key + 1). \(.value.title): \(.value.savings_ms)ms savings"
elif .value.savings_kb then
  "  \(.key + 1). \(.value.title): \(.value.savings_kb)kb savings"
else
  "  \(.key + 1). \(.value.title)"
end
' "$LIGHTHOUSE_FILE" 2>/dev/null || echo "  No major optimization opportunities found"
echo ""

# Extract diagnostics (items with warnings)
echo "⚠️  Diagnostics & Warnings:"
jq -r '
[.audits | to_entries[] |
  select(.value.scoreDisplayMode == "numeric" and .value.score != null and .value.score < 0.9) |
  {
    title: .value.title,
    score: (.value.score * 100 | floor),
    display: .value.displayValue
  }
] |
sort_by(.score) |
.[:5] |
to_entries[] |
"  \(.key + 1). \(.value.title) (Score: \(.value.score)/100) \(.value.display // "")"
' "$LIGHTHOUSE_FILE" 2>/dev/null || echo "  All diagnostics passing"
echo ""

# Extract resource summary
echo "📦 Resource Summary:"
jq -r '
.audits["resource-summary"].details.items[] |
"  \(.resourceType): \(.requestCount) requests, \((.size / 1024) | floor)kb transferred"
' "$LIGHTHOUSE_FILE" 2>/dev/null || echo "  Resource summary not available"
echo ""

echo "=== END SUMMARY ==="
echo ""
echo "💡 Tip: Focus on metrics with ❌ and opportunities with >200ms savings first"
