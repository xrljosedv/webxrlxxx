const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function cargarRutasDinamicamente(dir) {
  const rutas = [];
  
  function explorarDirectorio(directorio) {
    const archivos = fs.readdirSync(directorio);
    
    for (const archivo of archivos) {
      const rutaCompleta = path.join(directorio, archivo);
      const estadistica = fs.statSync(rutaCompleta);
      
      if (estadistica.isDirectory()) {
        explorarDirectorio(rutaCompleta);
      } else if (archivo.endsWith('.js') && archivo !== 'api.js' && archivo !== 'index.js') {
        try {
          const modulo = require(rutaCompleta);
          
          if (Array.isArray(modulo)) {
            rutas.push(...modulo);
          } else if (typeof modulo === 'object') {
            rutas.push(modulo);
          }
        } catch (error) {
          console.error(`Error cargando ${rutaCompleta}:`, error.message);
        }
      }
    }
  }
  
  explorarDirectorio(dir);
  return rutas;
}

const rutasAPI = cargarRutasDinamicamente(__dirname);

for (const ruta of rutasAPI) {
  if (ruta.metode === 'GET') {
    router.get(ruta.endpoint, async (req, res) => {
      try {
        const resultado = await ruta.run({ req });
        res.status(resultado.code || 200).json(resultado);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          code: 500
        });
      }
    });
  } else if (ruta.metode === 'POST') {
    router.post(ruta.endpoint, async (req, res) => {
      try {
        const resultado = await ruta.run({ req });
        res.status(resultado.code || 200).json(resultado);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          code: 500
        });
      }
    });
  }
}

router.get('/listar', (req, res) => {
  const lista = rutasAPI.map(r => ({
    metodo: r.metode,
    endpoint: r.endpoint,
    nombre: r.nombre || r.name,
    categoria: r.categoria || r.category,
    descripcion: r.descripcion || r.description,
    premium: r.isPremium || false,
    publico: r.isPublic || true
  }));
  
  res.json({
    success: true,
    total: lista.length,
    data: lista
  });
});

module.exports = router;