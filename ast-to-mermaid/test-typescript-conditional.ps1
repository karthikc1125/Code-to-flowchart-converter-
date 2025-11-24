# Test TypeScript conditional statements via CLI

# Define the TypeScript code to test
$typescriptCode = @"
if (true) {
  // body
}

if (false) {
  // then body
} else {
  // else body
}

if (true) {
  // first body
} else if (false) {
  // second body
} else {
  // else body
}
"@

# Create the JSON body for the request
$body = @{
    code = $typescriptCode
    language = "typescript"
} | ConvertTo-Json

# Send the request to the AST-to-Mermaid service
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3400/convert" -Method Post -Body $body -ContentType "application/json"
    
    # Output the Mermaid diagram
    Write-Host "Mermaid Diagram:"
    Write-Host $response.mermaid
} catch {
    Write-Host "Error occurred while testing TypeScript conditional statements:"
    Write-Host $_.Exception.Message
}