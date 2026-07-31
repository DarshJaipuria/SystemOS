/**
 * User Repository Layer
 */
import { db } from '../db.js';

export const userRepository = {
  findById: async (id) => {
    return db.user.findUnique({
      where: { id },
    });
  },

  findByEmail: async (email) => {
    return db.user.findUnique({
      where: { email },
    });
  },

  create: async (email, passwordHash, name = null) => {
    return db.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });
  },
};
