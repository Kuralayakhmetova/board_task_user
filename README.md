Auth Module (Login + JWT)

Backend авторизация на JWT.
Реализован login пользователя и защита маршрутов через JwtStrategy.

Установка
npm install

Переменные окружения

Создайте файл .env на основе .env.example.

Пример .env.example:

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=3000

Запуск проекта
npm run start:dev

Сервер запускается на:

http://localhost:3000

Эндпоинты
Login
POST /auth/login

Body:

{
  "email": "student@example.com",
  "password": "StrongPass123"
}

Ответ:

{
  "accessToken": "<jwt_token>"
}
Protected route
GET /auth/me

Header:

Authorization: Bearer <jwt_token>

Ошибки

Ситуация	Ответ

Неверный email или пароль	401 Unauthorized
Нет токена	401 Unauthorized
Токен неверный или просрочен	401 Unauthorized
Невалидный body	400 Bad Request
Используемые технологии

NestJS

Passport.js

passport-jwt

Prisma ORM