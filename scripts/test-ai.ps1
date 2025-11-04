# PowerShell test script for local AI endpoints
# Usage: from project root after starting dev server (pnpm dev / npm run dev)
#   .\scripts\test-ai.ps1

$base = 'http://localhost:3000'

Write-Host "Checking AI status..."
try {
    $status = Invoke-RestMethod -Uri "$base/api/ai/status" -Method Get
    Write-Host "Status:" ($status | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Status check failed:`n$_"
}

Write-Host "\nTesting /api/ai/ask with a simple query..."
$body = @{
    query = "Give a short example JSON response for a dataset with columns: date, sales, expenses"
    dataset = $null
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri "$base/api/ai/ask" -Method Post -ContentType 'application/json' -Body $body
    Write-Host "Response:" ($resp | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Ask request failed:`n$_"
}

Write-Host "\nDone. If you get 'Missing GOOGLE_AI_API_KEY' or HTTP 500, ensure .env.local is set and the dev server restarted."