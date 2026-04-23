# Digital Bank Frontend

Interfaz web de banca digital construida con React y Vite, pensada para mostrar tarjetas, catalogo de servicios, pagos, dashboard y autenticacion en una experiencia moderna y responsiva.

## Que hace esta aplicacion

- Muestra tarjetas de debito y credito con estado, saldo y reverso interactivo.
- Permite activar el flujo de credito cuando se cumplen las 10 compras con debito.
- Consume el catalogo de servicios para pagos desde el frontend.
- Dispara pagos con seguimiento por `traceId` y consulta de estado.
- Presenta dashboard, historial y modales de operacion con una interfaz premium.

## Modulos principales

- `src/pages/DashboardPage.jsx`: resumen financiero y tarjetas principales.
- `src/pages/CardsPage.jsx`: vista de tarjetas, activacion y acciones de recarga o pago.
- `src/pages/CatalogPage.jsx`: listado de servicios para pago.
- `src/components/catalog/PaymentModal.jsx`: flujo de pago con seguimiento de estado.
- `src/components/cards/BankCard.jsx`: tarjeta bancaria con volteo y vista detallada.
- `src/components/cards/CardFundsDialog.jsx`: modal para recargar o pagar tarjeta.

## Servicios consumidos

- `VITE_CARD_SERVICE_URL`
- `VITE_PAYMENT_SERVICE_URL`
- `VITE_CATALOG_SERVICE_URL`

La capa de `src/services` centraliza el acceso a tarjetas, catalogo y pagos para evitar logica duplicada en las paginas.

## Stack tecnico

- React 19
- Vite
- Tailwind CSS v4
- Shadcn UI
- Zustand
- Recharts
- Axios
- Sonner

## Flujo funcional

1. El usuario entra al dashboard y ve su resumen financiero.
2. En tarjetas puede recargar debito o pagar credito.
3. En catalogo selecciona un servicio y ejecuta el pago.
4. El pago se rastrea con `traceId` hasta obtener estado final.
5. La interfaz refresca los datos despues de cada operacion exitosa.

## Despliegue

El frontend se compila y publica en AWS con Terraform, S3 y CloudFront.

```bash
npm install
npm run build
powershell -ExecutionPolicy Bypass -File .\terraform\deploy.ps1
```

## Estructura resumida

```text
digital-bank-frontend
├── src
│   ├── components
│   ├── pages
│   └── services
├── public
├── terraform
└── README.md
```
