
export function parseResponse(response) {
  let data = response.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.warn('Response data is not JSON string:', data);
    }
  }
  if (typeof data?.body === 'string') {
    try {
      const bodyData = JSON.parse(data.body);
      data = Array.isArray(bodyData)
        ? bodyData
        : { ...data, ...bodyData };
    } catch (e) {
      console.warn('Body data is not JSON string:', data.body);
    }
  }

  return data;
}

export function handleError(error, defaultMessage = 'Error en la operación') {
  console.error('API Error:', error);

  const responseData = error.response?.data;
  const message = responseData?.error
    || responseData?.message
    || (typeof responseData?.body === 'string' ? JSON.parse(responseData.body)?.error : null)
    || defaultMessage;

  return { success: false, message };
}
