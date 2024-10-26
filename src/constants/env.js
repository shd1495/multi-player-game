import dotenv from 'dotenv';

dotenv.config();

export const HOST = process.env.HOST || 'localhost';

export const PORT = process.env.PORT || '5555';
