# Quiz App (Realtime)



Веб-приложение для проведения квизов в реальном времени.



## Возможности


- Регистрация и авторизация пользователей

- Создание квизов (организатором)

- Добавление, удаление и редактирование вопросов

- Подключение к комнате по коду

- Проведение квиза в реальном времени (Socket.IO)

- Таймер для вопросов

- Лидерборд с результатами

- История игр (результаты сохраняются)


## Используемые технологии



### Frontend:

- React

- Axios

- Socket.IO-client



### Backend:

- Node.js

- Express

- Socket.IO

- Prisma ORM

- PostgreSQL (или SQLite)



### Установка и запуск



### 1. Клонировать репозиторий


git clone https://github.com/bengalskiymops/quiz-app.git

cd quiz-app



### 2. Установка зависимостей

Backend:

cd server

npm install

Frontend:

cd ../client

npm install



### 3. Настройка базы данных



Создать файл .env в папке server:



DATABASE_URL="file:./dev.db"

JWT_SECRET="secretkey"



Применить миграции:



npx prisma migrate dev



### 4. Запуск проекта



Backend:

cd server

node index.js



Frontend:

cd client

npm start

