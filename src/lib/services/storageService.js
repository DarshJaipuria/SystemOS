/**
 * Storage Service Abstraction Provider
 * Decouples file uploads from filesystem so S3/Cloudinary/Blob can be swapped easily.
 */
import { config } from '../config.js';

class LocalStorageProvider {
  async uploadFile(fileBuffer, fileName, contentType = 'image/jpeg') {
    // In local development, we mock the uploader by returning a mock local url
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${config.appUrl}/uploads/${timestamp}_${cleanName}`;
  }

  async deleteFile(fileUrl) {
    // Mock local delete
    return true;
  }
}

class S3StorageProvider {
  async uploadFile(fileBuffer, fileName, contentType) {
    throw new Error('S3 Storage Provider not configured. Set environment variables to enable.');
  }
  async deleteFile(fileUrl) {
    throw new Error('S3 Storage Provider not configured.');
  }
}

// Select active provider based on configurations
const getActiveProvider = () => {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  switch (provider.toLowerCase()) {
    case 's3':
    case 'aws':
      return new S3StorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
};

const activeProvider = getActiveProvider();

export const storageService = {
  /**
   * Uploads a file buffer to active storage provider
   * @param {Buffer} fileBuffer
   * @param {string} fileName
   * @param {string} contentType
   * @returns {Promise<string>} - Fully resolved URL to the uploaded file
   */
  uploadFile: async (fileBuffer, fileName, contentType) => {
    return activeProvider.uploadFile(fileBuffer, fileName, contentType);
  },

  /**
   * Deletes a file from active storage provider
   * @param {string} fileUrl
   * @returns {Promise<boolean>}
   */
  deleteFile: async (fileUrl) => {
    return activeProvider.deleteFile(fileUrl);
  }
};
