# Run local integration tests with docker-compose
param()
$ErrorActionPreference = 'Stop'

Write-Host "Starting Postgres via docker-compose..."
docker-compose up -d

Write-Host "Waiting for Postgres on localhost:5432..."
$timeout = 120
$elapsed = 0
while ($elapsed -lt $timeout) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 5432)
        $tcp.Close()
        break
    } catch {
        Start-Sleep -Seconds 1
        $elapsed++
    }
}
if ($elapsed -ge $timeout) { Write-Error "Postgres did not become available in time." ; exit 1 }

Write-Host "Generating Prisma client and running migrations..."
npx prisma generate
npx prisma migrate dev --name ci --preview-feature

Write-Host "Seeding database..."
npm run seed

Write-Host "Running integration tests..."
npm run test:integration

$rc = $LASTEXITCODE

Write-Host "Tearing down docker-compose..."
docker-compose down

exit $rc
