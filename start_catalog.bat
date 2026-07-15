@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
cd product-catalog-service
start "Product Catalog Service" /min cmd /c ".\mvnw.cmd spring-boot:run"
