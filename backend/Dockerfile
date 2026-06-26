# --- Etapa 1: compilar el .jar con Maven ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# El contexto de build en EasyPanel es la raíz del repo, por eso copiamos backend/
COPY backend/ ./
RUN mvn -q -DskipTests clean package

# --- Etapa 2: imagen liviana para correr ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
