/**
 * Reflection Domain Service
 */
import { reflectionRepository } from '../repositories/reflectionRepository.js';

export const reflectionService = {
  getReflection: async (userId, month, year) => {
    return reflectionRepository.findUnique(userId, month, year);
  },

  saveReflection: async (userId, month, year, data) => {
    // Validate image format if url is provided
    if (data.imageUrl) {
      try {
        new URL(data.imageUrl);
      } catch (_) {
        throw new Error('Invalid reflection image URL provided.');
      }
    }

    if (data.polaroidUrl) {
      try {
        new URL(data.polaroidUrl);
      } catch (_) {
        throw new Error('Invalid polaroid image URL provided.');
      }
    }

    return reflectionRepository.upsert(userId, month, year, data);
  }
};
