import dotenv from 'dotenv';

dotenv.config();

export const HOST = process.env.HOST || 'localhost';

export const PORT = process.env.PORT || '5555';

export const VERSION = process.env.VERSION || '1.0.0';
