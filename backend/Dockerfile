# --- STAGE 1: build ---
# Imagem com Maven + JDK 21 só pra compilar. NÃO VAI PRO ARTEFATO FINAL.
FROM docker.io/library/maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copia só o pom.xml primeiro.
# Se nada for alterado nas dependências, essa camada fica em cache e o
# próximo build não baixa tudo de novo do Maven Central.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Só agora copia o código-fonte (isso muda com frequência, então
# fica depois das dependências de propósito).
COPY src ./src

# Empacota o .jar pulando os testes (testes devem rodar no CI, não no build da imagem)
RUN mvn clean package -DskipTests -B

# --- STAGE 2: runtime ---
# Imagem final enxuta: só JRE (não precisa do JDK completo nem do Maven pra rodar)
FROM docker.io/library/eclipse-temurin:21-jre-alpine

WORKDIR /app

# Boa prática: não rodar a aplicação como root dentro do container
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia só o .jar final do estágio de build (nada de Maven, código-fonte
# ou cache de dependências vai pra imagem final)
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
