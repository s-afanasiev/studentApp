СКАЧИВАНИЕ И ЗАПУСК ОБРАЗА
docker run --name student-pg -e POSTGRES_PASSWORD=admin -d postgres
С Указанием Версии:
docker run --name student-pg-13.3 -e POSTGRES_PASSWORD=admin -d postgres:13.3
Также с пробросом портов:
docker run --name student-pg -p 5432:5432 -e POSTGRES_PASSWORD=admin -d postgres:latest
С указанием пользователя:
docker run --name student-pg -p 5432:5432 -e POSTGRES_USER=student_user -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=student_db -d postgres:latest

КОНСОЛЬ POSTGRES:
psql --username=postgres --dbname=postgres
или
psql -U postgres -d postgres
или с предзаданным на этапе DOcker'а имененем БД:
psql -U student_user -d student_db
psql -U postgres -d postgres

==============================================
docker-compose.yml

version: '3.9'

services:
  student_db:
    container_name: student-pg
    image: postgres:latest
    environment:
      POSTGRES_USER: student_user
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: student_db
    volumes:
      - ./postgres_data:/var/lib/postgresql/data/
    ports:
      - 5432:5432
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U student_user -d student_db"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 4G
  pgadmin:
    container_name: pgadmin
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.ru
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - 5050:80
volumes:
  postgres_data:
networks:
  postgres:
    driver: bridge
==============================================
# Локальный запуск приложения

1. Установка зависимостей
	`npm install`

2. Разворачивание окружения
	`docker-compose up -d`

3. Подключение к БД через pgadmin
	Вход в pgadmin:
		admin@admin.ru
		admin
	Подключение к Серверу БД:
		Host name/address = student-pg
		Port = 5432
		Username = student_user
		Password = admin
==============================================
SEQUELIZE:
const student = function(sequelize) {
	return sequelize.define("Cars", {
		personalCode: {
			type: Sequelize.STRING(100)
		},
		name: {
			type: Sequelize.STRING(100)
		},
		lastName: {
			type: Sequelize.STRING(100)
		}
	});
}
module.exports = student;