import { catalogApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

export function normalizeCatalogItem(item) {
  return {
    id: item.id || item.ID,
    categoria: item.categoria || item.Categoria,
    proveedor: item.proveedor || item.Proveedor,
    servicio: item.servicio || item.Servicio,
    plan: item.plan || item.Plan,
    precio_mensual: parseFloat(item.precio_mensual || 0),
    detalles: item.detalles || '',
    estado: item.estado || 'Activo',
  };
}

export const catalogService = {

  getCatalog: async () => {
    try {
      const response = await catalogApi.get('/catalog');
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      const normalizedItems = items.map(normalizeCatalogItem);

      return { success: true, data: normalizedItems };
    } catch (error) {
      return handleError(error, 'Error al obtener el catálogo');
    }
  },

  updateCatalog: async (csvContent) => {
    try {
      const response = await catalogApi.post('/catalog/update', { csv_data: csvContent });
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'Error al actualizar el catálogo');
    }
  }
};
