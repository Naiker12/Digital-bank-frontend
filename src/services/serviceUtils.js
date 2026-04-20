/**
 * Parsea la respuesta de una Lambda detrás de API Gateway Proxy.
 * Las lambdas suelen retornar un objeto con { statusCode, body } 
 * donde body es un string JSON que necesita ser procesado.
 */
export function parseResponse(response) {
  let data = response.data;

  //  Si la respuesta de axios es un string, parsearla
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.warn('Response data is not JSON string:', data);
    }
  }

  //  Si data tiene 'body' como string (API Gateway proxy pattern)
  if (typeof data?.body === 'string') {
    try {
      const bodyData = JSON.parse(data.body);
      data = { ...data, ...bodyData };
    } catch (e) {
      console.warn('Body data is not JSON string:', data.body);
    }
  }

  return data;
}

/**
 * Manejador estándar de errores para servicios.
 */
export function handleError(error, defaultMessage = 'Error en la operación') {
  console.error('API Error:', error);

  const responseData = error.response?.data;
  const message = responseData?.error
    || responseData?.message
    || (typeof responseData?.body === 'string' ? JSON.parse(responseData.body)?.error : null)
    || defaultMessage;

  return { success: false, message };
}
