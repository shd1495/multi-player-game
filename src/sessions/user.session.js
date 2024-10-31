import { updateUserPosition } from '../db/user/user.db.js';
import { userSessions } from './sessions.js';

export const addUser = (user) => {
  userSessions.push(user);
  return user;
};

export const removeUser = async (socket) => {
  const idx = userSessions.findIndex((user) => {
    return user.socket === socket;
  });
  if (idx != -1) {
    await updateUserPosition(userSessions[idx].id, userSessions[idx].x, userSessions[idx].y);
    return userSessions.splice(idx, 1)[0];
  }
};

export const getAllUser = () => {
  return userSessions;
};

export const getUserById = (id) => {
  return userSessions.find((user) => user.id === id);
};

export const getUserBySocket = (socket) => {
  return userSessions.find((user) => user.socket === socket);
};
