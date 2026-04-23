$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$distPath = Join-Path $repoRoot "dist"
$distIndex = Join-Path $distPath "index.html"

Write-Host "----------------------------------------"
Write-Host "Starting Deployment Process..."
Write-Host "----------------------------------------"
if (!(Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "Error: terraform is not installed or not in PATH."
}

if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "Error: aws-cli is not installed or not in PATH."
}
Write-Host "Checking for build artifacts..."
if (!(Test-Path $distIndex)) {
    Write-Host "Build not found. Building React app..."
    Push-Location $repoRoot
    npm install
    npm run build
    Pop-Location
} else {
    Write-Host "Found existing build in dist/. Skipping build step."
}
Write-Host "Extracting infrastructure details from Terraform..."
Push-Location $scriptRoot
$BUCKET_NAME = terraform output -raw s3_bucket_name
$DISTRIBUTION_ID = terraform output -raw cloudfront_distribution_id
$DOMAIN_NAME = terraform output -raw cloudfront_domain_name
Pop-Location

if ([string]::IsNullOrEmpty($BUCKET_NAME) -or [string]::IsNullOrEmpty($DISTRIBUTION_ID)) {
    Write-Error "Error: Could not get Terraform outputs. Please run 'terraform apply' first."
}

Write-Host "Target S3 Bucket: $BUCKET_NAME"
Write-Host "CloudFront ID: $DISTRIBUTION_ID"
Write-Host "Uploading to S3..."
aws s3 sync $distPath "s3://$BUCKET_NAME" --delete
Write-Host "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" | Out-Null

Write-Host "----------------------------------------"
Write-Host "Deployment completed!"
Write-Host "Your app is live at: https://$DOMAIN_NAME"
Write-Host "----------------------------------------"
