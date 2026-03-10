const axios = require('axios');

function formatearRespuesta(exito, datos, mensaje = null, codigo = 200) {
  return {
    success: exito,
    data: datos || null,
    message: mensaje || (exito ? 'Operación exitosa' : 'Error en la operación'),
    code: codigo,
    timestamp: new Date().toISOString()
  };
}

function manejarError(error, mensajePersonalizado = 'Error interno del servidor') {
  console.error('Error:', error.message);
  
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || mensajePersonalizado,
      code: error.response.status || 500,
      details: error.response.data
    };
  }
  
  return {
    success: false,
    message: mensajePersonalizado,
    code: 500,
    details: error.message
  };
}

function validarRequeridos(campos, cuerpo) {
  const faltantes = [];
  
  for (const campo of campos) {
    if (!cuerpo[campo] || cuerpo[campo].toString().trim() === '') {
      faltantes.push(campo);
    }
  }
  
  return {
    valid: faltantes.length === 0,
    missing: faltantes
  };
}

function generarStringAleatorio(longitud = 10) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return resultado;
}

function enmascararIP(ip) {
  if (!ip) return '0.0.0.0';
  
  const partes = ip.split('.');
  if (partes.length === 4) {
    return `${partes[0]}.${partes[1]}.*.*`;
  }
  
  return ip.replace(/:\d+/, ':*');
}

function obtenerUserAgent(req) {
  return req.headers['user-agent'] || 'Desconocido';
}

function obtenerIPCliente(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         '0.0.0.0';
}

async function fetchConTimeout(url, opciones = {}, tiempo = 10000) {
  const controlador = new AbortController();
  const timeoutId = setTimeout(() => controlador.abort(), tiempo);
  
  try {
    const respuesta = await axios({
      url,
      signal: controlador.signal,
      timeout: tiempo,
      ...opciones
    });
    
    clearTimeout(timeoutId);
    return respuesta;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function parsearParametrosQuery(query, permitidos = []) {
  const parseados = {};
  
  for (const clave in query) {
    if (permitidos.length === 0 || permitidos.includes(clave)) {
      parseados[clave] = query[clave];
    }
  }
  
  return parseados;
}

function esEmailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function esURLValida(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function formatearBytes(bytes, decimales = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimales < 0 ? 0 : decimales;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + tamaños[i];
}

function calcularPorcentaje(valor, total) {
  if (total === 0) return 0;
  return parseFloat(((valor / total) * 100).toFixed(2));
}

function agruparPor(array, clave) {
  return array.reduce((resultado, item) => {
    const claveGrupo = item[clave];
    
    if (!resultado[claveGrupo]) {
      resultado[claveGrupo] = [];
    }
    
    resultado[claveGrupo].push(item);
    return resultado;
  }, {});
}

function ordenarPorClave(array, clave, ascendente = true) {
  return [...array].sort((a, b) => {
    if (ascendente) {
      return a[clave] > b[clave] ? 1 : -1;
    } else {
      return a[clave] < b[clave] ? 1 : -1;
    }
  });
}

function arrayUnico(array) {
  return [...new Set(array)];
}

function dividirArray(array, tamaño) {
  const fragmentos = [];
  
  for (let i = 0; i < array.length; i += tamaño) {
    fragmentos.push(array.slice(i, i + tamaño));
  }
  
  return fragmentos;
}

function dormir(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function obtenerTimestamp() {
  return new Date().toISOString();
}

function obtenerFechaString() {
  return new Date().toLocaleDateString('es-ES');
}

function obtenerHoraString() {
  return new Date().toLocaleTimeString('es-ES');
}

module.exports = {
  formatearRespuesta,
  manejarError,
  validarRequeridos,
  generarStringAleatorio,
  enmascararIP,
  obtenerUserAgent,
  obtenerIPCliente,
  fetchConTimeout,
  parsearParametrosQuery,
  esEmailValido,
  esURLValida,
  formatearBytes,
  calcularPorcentaje,
  agruparPor,
  ordenarPorClave,
  arrayUnico,
  dividirArray,
  dormir,
  obtenerTimestamp,
  obtenerFechaString,
  obtenerHoraString
};