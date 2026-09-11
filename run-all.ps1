$rootDir = $PSScriptRoot
Write-Host "Starting Keystone Field Service Management Application..." -ForegroundColor Cyan

Write-Host "Starting Spring Boot Backend in a new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\keystone-backend'; ..\maven-bin\apache-maven-3.9.9\bin\mvn spring-boot:run"

Write-Host "Starting Vite Frontend in a new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\keystone-frontend'; npm run dev"

Write-Host "Both services have been launched in separate windows!" -ForegroundColor Cyan

