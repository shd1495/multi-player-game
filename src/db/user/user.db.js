import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { v4 as uuidv4 } from 'uuid';
import { toCamelCase } from '../../utils/transformCase.js';

export const findUserByDeviceId = async (deviceId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceId]);
  return toCamelCase(rows[0]);
};

export const createUser = async (deviceId) => {
  const id = uuidv4();
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [id, deviceId]);
  return { id, deviceId };
};

export const updateUserLogin = async (deviceId) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [deviceId]);
};

export const updateUserPosition = async (deviceId, x, y) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_POSITION, [x, y, deviceId]);
};
