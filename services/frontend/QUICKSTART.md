# Quick Start - Frontend + Backend

## Resumen de Conexión

El frontend está configurado para conectarse al backend a través del **Gateway** en `http://localhost:8000`.

### Configuración del Proxy (Vite)

En `vite.config.ts`:
- `/v1/*` → proxy al gateway
- `/ws/*` → WebSocket proxy

### Rutas del Gateway

| Endpoint | Servicio |
|----------|----------|
| `http://localhost:8000/v1/auth/*` | Auth Service |
| `http://localhost:8000/v1/wallet/*` | Wallet Service |
| `http://localhost:8000/v1/tokenization/*` | Tokenization Service |
| `http://localhost:8000/v1/marketplace/*` | Marketplace Service |
| `http://localhost:8000/v1/education/*` | Education Service |
| `http://localhost:8000/v1/admin/*` | Admin Service |

## Cómo Ejecutar

### Opción 1: Script Automático (Recomendado)

```bash
cd services/frontend
./start-dev.sh
```

Comandos disponibles:
- `./start-dev.sh` - Inicia backend + frontend
- `./start-dev.sh backend` - Solo backend
- `./start-dev.sh frontend` - Solo frontend
- `./start-dev.sh stop` - Detiene todo
- `./start-dev.sh health` - Verifica salud

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd infra
cp .env.local.example .env.local
docker compose -f docker-compose.local.yml up -d

# Verificar que esté listo
curl http://localhost:8000/health
```

**Terminal 2 - Frontend:**
```bash
cd services/frontend
npm install
npm run dev
```

## URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Gateway API | http://localhost:8000 |
| Health Check | http://localhost:8000/health |

## Estado del Build

✅ **Build exitoso** - El frontend compila correctamente con:
- 57 archivos TypeScript
- PWA configurada con Workbox
- Tailwind CSS con tema oscuro (mempool style)
- Todos los componentes especializados funcionando

## Estructura del Frontend

```
src/
├── components/
│   ├── ui/          # Componentes base (Button, Card, Input, Badge)
│   └── specialized/ # Componentes RWA (SatoshiAmount, AIScoreGauge, etc.)
├── pages/           # 14 páginas completas
├── stores/          # Zustand stores
├── hooks/           # Custom hooks
└── types/           # TypeScript definitions
```

## Notas Importantes

1. **Backend requiere Docker** - El backend usa PostgreSQL, Redis, Bitcoin Core, LND y Elements
2. **Variables de entorno** - Copia `.env.local.example` a `.env.local` en `infra/`
3. **Primera vez** - El backend tarda ~2-3 minutos en iniciar todos los servicios
4. **Frontend** - Usa `npm run dev` para desarrollo con hot reload

## Próximos Pasos

1. Configurar variables de entorno reales en `infra/.env.local`
2. Integrar API calls reales (actualmente usa mock data)
3. Configurar WebSocket para actualizaciones en tiempo real
4. Implementar autenticación real con el backend
