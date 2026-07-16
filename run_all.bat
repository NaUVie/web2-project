@echo off
title E-commerce Microservices Launcher
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
echo ==========================================================
echo        Nexus Shop Microservices - Java 21 Launcher
echo ==========================================================
echo.
echo Requirements:
echo 1. MySQL running on localhost:3306 (with root user, blank password)
echo 2. Apache Kafka running on localhost:9092
echo 3. Redis running on localhost:6379
echo.
echo Launching services...
echo.

echo [1/8] Launching Eureka Server (Port 8761)...
cd eureka-server
start "Eureka Server" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [2/8] Launching User Service (Port 8811)...
cd user-service
start "User Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [3/8] Launching Product Catalog Service (Port 8810)...
cd product-catalog-service
start "Product Catalog Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [4/8] Launching Product Recommendation Service (Port 8812)...
cd product-recommendation-service
start "Product Recommendation Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [5/8] Launching Order Service (Port 8813)...
cd order-service
start "Order Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [6/8] Launching Chatbot Service (Port 8814)...
cd chatbot-service
start "Chatbot Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [7/8] Launching Payment Service (Port 8815)...
cd payment-service
start "Payment Service" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..
timeout /t 5

echo [8/8] Launching API Gateway (Port 8900)...
cd api-gateway
start "API Gateway" cmd /k ".\mvnw.cmd spring-boot:run"
cd ..

echo.
echo ==========================================================
echo All services launched!
echo Access the Application Frontend at: http://localhost:8900/
echo Access Eureka Dashboard at: http://localhost:8761/
echo ==========================================================
pause
