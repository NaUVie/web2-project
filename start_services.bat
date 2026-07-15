@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
echo Launching services with JAVA_HOME=%JAVA_HOME%

echo Starting Eureka Server...
start "Eureka Server" /min cmd /c "cd eureka-server && .\mvnw.cmd spring-boot:run"

echo Starting User Service...
start "User Service" /min cmd /c "cd user-service && .\mvnw.cmd spring-boot:run"

echo Starting Product Catalog Service...
start "Product Catalog Service" /min cmd /c "cd product-catalog-service && .\mvnw.cmd spring-boot:run"

echo Starting Product Recommendation Service...
start "Product Recommendation Service" /min cmd /c "cd product-recommendation-service && .\mvnw.cmd spring-boot:run"

echo Starting Order Service...
start "Order Service" /min cmd /c "cd order-service && .\mvnw.cmd spring-boot:run"

echo Starting Chatbot Service...
start "Chatbot Service" /min cmd /c "cd chatbot-service && .\mvnw.cmd spring-boot:run"

echo Starting API Gateway...
start "API Gateway" /min cmd /c "cd api-gateway && .\mvnw.cmd spring-boot:run"

echo All services launched!
