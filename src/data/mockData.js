// ─── USUARIOS DE PRUEBA ───────────────────────────────
export const MOCK_USERS = [
  {
    uuid: 'u-001',
    name: 'Naiker',
    lastName: 'Gómez',
    email: 'naiker@digitalbank.com',
    phone: '+57 301 234 5678',
    document: '1098765432',
    password: '1234',
    avatar: null,
  },
];

// ─── TARJETAS DE PRUEBA ───────────────────────────────
export const MOCK_CARDS = [
  {
    uuid: 'c-001',
    user_id: 'u-001',
    type: 'DEBIT',
    number: '4532 8901 2345 6789',
    last4: '6789',
    holder: 'NAIKER GOMEZ',
    expiry: '12/28',
    cvv: '321',
    balance: 2_350_000,
    creditLimit: null,
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    uuid: 'c-002',
    user_id: 'u-001',
    type: 'CREDIT',
    number: '5412 7534 9012 3456',
    last4: '3456',
    holder: 'NAIKER GOMEZ',
    expiry: '06/29',
    cvv: '987',
    balance: 1_200_000,
    creditLimit: 5_000_000,
    status: 'ACTIVE',
    createdAt: '2026-02-20',
  },
  {
    uuid: 'c-003',
    user_id: 'u-001',
    type: 'CREDIT',
    number: '3782 8224 6310 0051',
    last4: '0051',
    holder: 'NAIKER GOMEZ',
    expiry: '09/27',
    cvv: '456',
    balance: 0,
    creditLimit: 3_000_000,
    status: 'PENDING',
    createdAt: '2026-03-10',
  },
];

// ─── CATÁLOGO DE PRUEBA (Servicios que se pueden pagar) ────────
export const MOCK_CATALOG = [
  { id: 1,  categoria: 'Energía',    proveedor: 'Empresa Eléctrica Nacional', servicio: 'Luz Residencial', plan: 'Básico',    precio_mensual: 45.00,  detalles: '150 kWh incluidos',             estado: 'Activo' },
  { id: 2,  categoria: 'Energía',    proveedor: 'Empresa Eléctrica Nacional', servicio: 'Luz Residencial', plan: 'Premium',   precio_mensual: 75.00,  detalles: '300 kWh incluidos',             estado: 'Activo' },
  { id: 3,  categoria: 'Agua',       proveedor: 'Acueducto Municipal',        servicio: 'Agua Potable',    plan: 'Estándar',  precio_mensual: 25.00,  detalles: '20 m³ incluidos',               estado: 'Activo' },
  { id: 4,  categoria: 'Internet',   proveedor: 'Tigo',                       servicio: 'Internet Hogar',  plan: 'Básico',    precio_mensual: 89.90,  detalles: '100 Mbps',                      estado: 'Activo' },
  { id: 5,  categoria: 'Internet',   proveedor: 'Tigo',                       servicio: 'Internet Hogar',  plan: 'Avanzado',  precio_mensual: 129.90, detalles: '200 Mbps',                      estado: 'Activo' },
  { id: 6,  categoria: 'Internet',   proveedor: 'Movistar',                   servicio: 'Fibra Óptica',    plan: 'Essential', precio_mensual: 79.90,  detalles: '120 Mbps',                      estado: 'Activo' },
  { id: 7,  categoria: 'Internet',   proveedor: 'Movistar',                   servicio: 'Fibra Óptica',    plan: 'Plus',      precio_mensual: 119.90, detalles: '250 Mbps',                      estado: 'Activo' },
  { id: 8,  categoria: 'Internet',   proveedor: 'Claro',                      servicio: 'Internet Hogar',  plan: 'Básico',    precio_mensual: 85.00,  detalles: '100 Mbps',                      estado: 'Activo' },
  { id: 9,  categoria: 'Internet',   proveedor: 'Claro',                      servicio: 'Internet Hogar',  plan: 'Full',      precio_mensual: 135.00, detalles: '300 Mbps',                      estado: 'Activo' },
  { id: 10, categoria: 'Telefonía',  proveedor: 'Tigo',                       servicio: 'Pospago',         plan: 'Control',   precio_mensual: 45.00,  detalles: '3 GB + Minutos ilimitados',     estado: 'Activo' },
  { id: 11, categoria: 'Telefonía',  proveedor: 'Tigo',                       servicio: 'Pospago',         plan: 'Max',       precio_mensual: 85.00,  detalles: '10 GB + Minutos ilimitados',    estado: 'Activo' },
  { id: 12, categoria: 'Telefonía',  proveedor: 'Movistar',                   servicio: 'Pospago',         plan: 'Básico',    precio_mensual: 40.00,  detalles: '2 GB + Minutos ilimitados',     estado: 'Activo' },
  { id: 13, categoria: 'Telefonía',  proveedor: 'Movistar',                   servicio: 'Pospago',         plan: 'Premium',   precio_mensual: 90.00,  detalles: '15 GB + Minutos ilimitados',    estado: 'Activo' },
  { id: 14, categoria: 'Telefonía',  proveedor: 'Claro',                      servicio: 'Pospago',         plan: 'Económico', precio_mensual: 35.00,  detalles: '1.5 GB + Minutos ilimitados',   estado: 'Activo' },
  { id: 15, categoria: 'Telefonía',  proveedor: 'Claro',                      servicio: 'Pospago',         plan: 'Total',     precio_mensual: 95.00,  detalles: '20 GB + Minutos ilimitados',    estado: 'Activo' },
  { id: 16, categoria: 'TV',         proveedor: 'Tigo',                       servicio: 'TV Digital',      plan: 'Básico',    precio_mensual: 59.90,  detalles: '80 canales',                    estado: 'Activo' },
  { id: 17, categoria: 'TV',         proveedor: 'Tigo',                       servicio: 'TV Digital',      plan: 'Ultra',     precio_mensual: 99.90,  detalles: '150 canales + HD',              estado: 'Activo' },
  { id: 18, categoria: 'TV',         proveedor: 'Claro',                      servicio: 'TV Cable',        plan: 'Estándar',  precio_mensual: 65.00,  detalles: '100 canales',                   estado: 'Activo' },
  { id: 19, categoria: 'TV',         proveedor: 'Claro',                      servicio: 'TV Cable',        plan: 'Premium',   precio_mensual: 110.00, detalles: '200 canales + HD',              estado: 'Activo' },
  { id: 20, categoria: 'Paquete',    proveedor: 'Tigo',                       servicio: 'Triple Play',     plan: 'Hogar',     precio_mensual: 199.90, detalles: 'Internet + TV + teléfono',      estado: 'Activo' },
];

// ─── TRANSACCIONES DE PRUEBA ─────────────────────────
export const MOCK_TRANSACTIONS = [
  { id: 't-001', cardId: 'c-001', type: 'PURCHASE', description: 'Supermercado Éxito',  amount: -185_000,   date: '2026-04-14', status: 'FINISH' },
  { id: 't-002', cardId: 'c-001', type: 'PURCHASE', description: 'Gasolina Terpel',     amount: -92_000,    date: '2026-04-13', status: 'FINISH' },
  { id: 't-003', cardId: 'c-002', type: 'PURCHASE', description: 'Amazon Colombia',     amount: -340_000,   date: '2026-04-12', status: 'FINISH' },
  { id: 't-004', cardId: 'c-001', type: 'DEPOSIT',  description: 'Nómina Abril',        amount: 3_500_000,  date: '2026-04-10', status: 'FINISH' },
  { id: 't-005', cardId: 'c-002', type: 'PAYMENT',  description: 'Pago parcial TC',     amount: 500_000,    date: '2026-04-09', status: 'FINISH' },
  { id: 't-006', cardId: 'c-001', type: 'SERVICE',  description: 'Claro Internet',      amount: -89_900,    date: '2026-04-08', status: 'FINISH' },
];
