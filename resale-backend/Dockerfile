# Stage 1: Build the application
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy the maven wrapper and pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Ensure the wrapper has execute permissions
RUN chmod +x mvnw
# Download dependencies (this layer is cached)
RUN ./mvnw dependency:go-offline

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar


EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]