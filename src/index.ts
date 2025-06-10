// Импорт необходимых модулей
import express, { Request, Response } from 'express'; // Express.js для создания сервера
import { connectDB } from './db'; // Функция подключения к БД (предположительно MongoDB или другой)
import cors from 'cors'; // Middleware для обработки CORS (кросс-доменных запросов)
import cookieParser from 'cookie-parser'; // Middleware для работы с куками
import dotenv from 'dotenv'; // Загрузка переменных окружения из .env файла
import router from './router'; // Основной роутер приложения (маршруты API)
import path from 'path'; // Работа с путями файловой системы

// Загрузка переменных окружения из .env файла
dotenv.config();

// Создание экземпляра Express-приложения
const app = express();

// Получение порта из переменных окружения или значение по умолчанию (5000)
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
// Получение разрешённого origin для CORS или значение по умолчанию (локальный фронтенд)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Проверка валидности порта (должен быть числом от 1 до 65535)
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.error('Invalid PORT in .env file');
    process.exit(1); // Завершение процесса при ошибке
}

// Настройка CORS middleware:
// - origin: разрешённый домен для запросов (из переменной окружения)
// - credentials: разрешение передавать куки и заголовки авторизации
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Middleware для парсинга JSON-тела запросов
app.use(express.json());
// Middleware для парсинга кук из запросов
app.use(cookieParser());
// Middleware для раздачи статических файлов (из папки /public/img)
app.use('/img', express.static(path.resolve(__dirname, '../public/img')));

// Подключение основного роутера (все маршруты будут начинаться с /api)
app.use('/api', router);

// Асинхронная функция для запуска сервера
const start = async () => {
    try {
        await connectDB(); // Подключение к базе данных
        // Запуск сервера на указанном порту
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Завершение процесса при ошибке
    }
};

// Вызов функции старта сервера
start();