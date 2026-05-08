FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
# jarを作成
RUN ./gradlew build -x test
EXPOSE 8080
CMD ["java", "-jar", "build/libs/app.jar"]