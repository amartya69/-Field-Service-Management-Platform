@echo off
set "ROOT_DIR=%~dp0"
echo Starting Keystone Field Service Management Application...

echo Starting Spring Boot Backend in a new window...
start "Keystone Backend" cmd /k "cd /d "%ROOT_DIR%keystone-backend" && ..\maven-bin\apache-maven-3.9.9\bin\mvn spring-boot:run"

echo Starting Vite Frontend in a new window...
start "Keystone Frontend" cmd /k "cd /d "%ROOT_DIR%keystone-frontend" && npm run dev"

echo Both services have been launched in separate windows!
pause

