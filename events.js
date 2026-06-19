# Scout — BSD Football Data Viewer

Visualizador de datos de partido en tiempo real usando la BSD Football API (sports.bzzoiro.com).

## Estructura

```
futbol-analyzer/
├── api/
│   ├── _bsd.js       ← helper compartido (auth + fetch)
│   ├── search.js     ← GET /api/search?q=barcelona
│   ├── events.js     ← GET /api/events?team_name=...
│   └── match.js      ← GET /api/match?id=12345
├── public/
│   └── index.html    ← Frontend SPA
├── vercel.json
├── .env.local        ← NO subir a git
└── .gitignore
```

## Variables de entorno

| Variable      | Descripción                        |
|---------------|------------------------------------|
| `BSD_API_KEY` | Tu API key de sports.bzzoiro.com   |

## Deploy en Vercel

```bash
# 1. Sube a GitHub
git init && git add . && git commit -m "init"
git remote add origin https://github.com/TU/repo.git
git push -u origin main

# 2. En vercel.com → New Project → importa el repo
# 3. Agrega la variable de entorno: BSD_API_KEY = tu_clave
# 4. Deploy
```

## Desarrollo local

```bash
npm i -g vercel
vercel dev       # levanta en http://localhost:3000
```

## Endpoints del backend

| Ruta                   | Descripción                                  |
|------------------------|----------------------------------------------|
| `GET /api/search?q=`   | Busca equipos y sus fixtures próximos        |
| `GET /api/match?id=`   | Carga en paralelo: evento + stats + lineups + odds + predicción ML + H2H + incidentes + forma reciente |

## Qué muestra

- **Resumen**: datos del partido, clima, preview IA
- **Cuotas**: 1X2, O/U, BTTS, doble oportunidad — consenso + mejor cuota por bookmaker
- **Predicción ML**: probabilities CatBoost, xG, marcadores más probables, recomendaciones
- **Estadísticas**: barras comparativas de posesión, tiros, xG, faltas, etc.
- **Alineaciones**: confirmadas o predichas por IA, con bajas
- **Forma reciente**: últimos 6 partidos de cada equipo con resultado y marcador
- **H2H**: historial agregado entre los dos equipos
- **Incidentes**: goles, tarjetas, cambios con minuto
- **JSON crudo**: acceso directo a la respuesta de cada endpoint
