import dotenv from 'dotenv';

dotenv.config();

export const HOST = process.env.HOST || 'localhost';

export const PORT = process.env.PORT || '5555';

export const VERSION = process.env.VERSION || '1.0.0';

export const DB_NAME = process.env.DB_NAME || 'database';
export const DB_USER = process.env.DB_USER || 'user';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;
