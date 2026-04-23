import { paymentApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

export const paymentService = {

  initiatePayment: async (payload) => {
    try {
      const response = await paymentApi.post('/payment', payload);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return {
        success: true,
        traceId: data.traceId || data.trace_id,
        data
      };
    } catch (error) {
      return handleError(error, 'Error al iniciar el pago');
    }
  },

  getPaymentStatus: async (traceId) => {
    try {
      if (!traceId) throw new Error('TraceId es obligatorio para consultar estado');

      const response = await paymentApi.get(`/payment/status/${traceId}`);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return {
        success: true,
        status: data.status,
        error: data.errorMessage || data.error_message,
        data
      };
    } catch (error) {
      return handleError(error, 'Error al consultar estado del pago');
    }
  }
};
