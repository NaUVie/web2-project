@echo off
title Build All Jars
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
echo ==========================================================
echo           Building All Microservices JARs (Java 21)
echo ==========================================================
echo.

set SERVICES=eureka-server user-service product-catalog-service product-recommendation-service order-service chatbot-service payment-service api-gateway

for %%s in (%SERVICES%) do (
    echo [%%s] Building package...
    cd %%s
    call .\mvnw.cmd clean package -DskipTests
    if errorlevel 1 (
        echo [ERROR] Failed to build %%s!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo.
echo ==========================================================
echo All JAR files built successfully in target/ folders!
echo ==========================================================
pause
