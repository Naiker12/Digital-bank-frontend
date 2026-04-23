import { userApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

export const userService = {

  updateProfile: async (userId, data) => {
    try {
      const response = await userApi.put(`/users/profile/${userId}`, data);
      const result = parseResponse(response);

      if (result.error) {
        return { success: false, message: result.error };
      }
      return { success: true, data: result };
    } catch (error) {
      return handleError(error, 'Error al actualizar el perfil');
    }
  },

  uploadAvatar: async (userId, base64Image, fileType = 'image/png') => {
    try {
      const cleanBase64 = base64Image.includes(',')
        ? base64Image.split(',')[1]
        : base64Image;

      const response = await userApi.post(`/users/profile/${userId}/avatar`, {
        image: cleanBase64,
        fileType: fileType
      });

      const result = parseResponse(response);

      if (result.error) {
        return { success: false, message: result.error };
      }
      return { success: true, url: result.url };
    } catch (error) {
      return handleError(error, 'Error al subir el avatar');
    }
  }
};
