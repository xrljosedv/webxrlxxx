let ws;
let maxPuntos = 60;
let itemsPorPagina = 10;
let datosMemoria = Array(maxPuntos).fill(0);
let datosCPU = Array(maxPuntos).fill(0);
let datosTasaSolicitudes = Array(maxPuntos).fill(0);
let datosTiempoRespuesta = Array(maxPuntos).fill(0);
let etiquetasTiempo = Array(maxPuntos).fill('');
let datosDescarga = Array(maxPuntos).fill(0);
let datosSubida = Array(maxPuntos).fill(0);
let statsAPI = [];
let paginaActual = 1;

let statsPrevias = {
  totalRequests: 0,
  requestsPerSecond: 0,
  dailyRequests: 0,
  totalEndpoints: 0,
  apiTotalRequests: 0,
  cpuUsage: 0,
  networkDown: 0,
  networkUp: 0,
  memoryUsage: 0
};

function conectarWebSocket() {
  const protocolo = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const urlWS = `${protocolo}://${window.location.host}/ws`;
  
  console.log('Conectando a WebSocket:', urlWS);
  ws = new WebSocket(urlWS);

  ws.onopen = () => {
    console.log('WebSocket conectado');
    const indicador = document.querySelector('.live-indicator');
    if (indicador) indicador.style.backgroundColor = '#10b981';
    document.body.style.opacity = '1';
  };

  ws.onmessage = (evento) => {
    try {
      const datos = JSON.parse(evento.data);
      if (datos.stats) actualizarEstadisticas(datos.stats);
    } catch (e) {
      console.error('Error al parsear mensaje WebSocket:', e);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket desconectado');
    const indicador = document.querySelector('.live-indicator');
    if (indicador) indicador.style.backgroundColor = '#ef4444';
    document.body.style.opacity = '0.7';
    setTimeout(conectarWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error('Error WebSocket:', error);
    const indicador = document.querySelector('.live-indicator');
    if (indicador) indicador.style.backgroundColor = '#ef4444';
    document.body.style.opacity = '0.7';
  };
}

function actualizarHora() {
  const elementoHora = document.getElementById('currentTime');
  if (elementoHora) {
    elementoHora.textContent = new Date().toLocaleString('es-ES');
  }
}

setInterval(actualizarHora, 1000);
actualizarHora();

Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter',sans-serif";

const opcionesComunes = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255,255,255,0.05)'
      },
      ticks: {
        padding: 10
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        padding: 10,
        maxTicksLimit: 10
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.9)',
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true
    }
  }
};

const graficoSistema = new Chart(document.getElementById('systemChart'), {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Uso de Memoria',
      data: datosMemoria,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56,189,248,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }, {
      label: 'Uso de CPU',
      data: datosCPU,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }]
  },
  options: {
    ...opcionesComunes,
    scales: {
      ...opcionesComunes.scales,
      y: {
        ...opcionesComunes.scales.y,
        max: 100
      }
    },
    plugins: {
      ...opcionesComunes.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  }
});

const graficoSolicitudes = new Chart(document.getElementById('requestChart'), {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Solicitudes/Segundo',
      data: datosTasaSolicitudes,
      borderColor: '#f85149',
      backgroundColor: 'rgba(56,189,248,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }]
  },
  options: opcionesComunes
});

const graficoRespuesta = new Chart(document.getElementById('responseChart'), {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Tiempo Respuesta (ms)',
      data: datosTiempoRespuesta,
      borderColor: '#f472b6',
      backgroundColor: 'rgba(244,114,182,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }]
  },
  options: {
    ...opcionesComunes,
    scales: {
      ...opcionesComunes.scales,
      y: {
        ...opcionesComunes.scales.y,
        ticks: {
          callback: valor => valor + ' ms'
        }
      }
    }
  }
});

const graficoHistorial = new Chart(document.getElementById('historyChart'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Total Solicitudes',
      data: [],
      backgroundColor: 'rgba(96,165,250,0.8)',
      borderColor: '#60a5fa',
      borderWidth: 1
    }, {
      label: 'Solicitudes API',
      data: [],
      backgroundColor: 'rgba(129,140,248,0.8)',
      borderColor: '#818cf8',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.05)'
        },
        ticks: {
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          padding: 10,
          maxRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true
      }
    }
  }
});

const graficoRed = new Chart(document.getElementById('networkChart'), {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Descarga',
      data: datosDescarga,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }, {
      label: 'Subida',
      data: datosSubida,
      borderColor: '#fb923c',
      backgroundColor: 'rgba(251,146,60,0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      fill: true
    }]
  },
  options: {
    ...opcionesComunes,
    plugins: {
      ...opcionesComunes.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  }
});

function actualizarDatosTemporales(nuevaMemoria, nuevaCPU, nuevaTasa, nuevoTiempo, nuevaDescarga, nuevaSubida) {
  const ahora = new Date().toLocaleTimeString('es-ES');

  etiquetasTiempo.shift();
  etiquetasTiempo.push(ahora);

  datosMemoria.shift();
  datosMemoria.push(parseFloat(nuevaMemoria) || 0);

  datosCPU.shift();
  datosCPU.push(parseFloat(nuevaCPU) || 0);

  datosTasaSolicitudes.shift();
  datosTasaSolicitudes.push(parseFloat(nuevaTasa) || 0);

  datosTiempoRespuesta.shift();
  datosTiempoRespuesta.push(parseFloat(nuevoTiempo) || 0);

  datosDescarga.shift();
  datosDescarga.push(parseFloat(nuevaDescarga) || 0);

  datosSubida.shift();
  datosSubida.push(parseFloat(nuevaSubida) || 0);
}

function animarValor(elemento, inicio, fin, duracion, unidad = '') {
  if (!elemento) return;

  const rango = fin - inicio;
  if (Math.abs(rango) < 1) {
    elemento.textContent = fin.toLocaleString() + unidad;
    return;
  }

  const tiempoPaso = Math.abs(Math.floor(duracion / Math.abs(rango)));
  const tiempoInicio = new Date().getTime();
  const tiempoFin = tiempoInicio + duracion;
  let temporizador;

  function ejecutar() {
    const ahora = new Date().getTime();
    const restante = Math.max((tiempoFin - ahora) / duracion, 0);
    const valor = Math.round(fin - restante * rango);
    elemento.textContent = valor.toLocaleString() + unidad;
    if (valor === fin) clearInterval(temporizador);
  }

  temporizador = setInterval(ejecutar, tiempoPaso);
  ejecutar();
}

function actualizarTarjetaMetrica(idElemento, nuevoValor, valorAnterior = 0, unidad = '') {
  const elemento = document.getElementById(idElemento);
  if (!elemento) return;

  if (idElemento === 'cpuUsage') {
    const actualMostrado = parseFloat(elemento.textContent.replace('%', '')) || 0;
    const nuevoCPU = parseFloat(nuevoValor) || 0;

    if (Math.abs(nuevoCPU - actualMostrado) >= 0.1) {
      elemento.textContent = nuevoCPU.toFixed(1) + unidad;
    }
    return;
  }

  animarValor(elemento, valorAnterior, nuevoValor, 500, unidad);
}

function renderizarSolicitudesRecientes(solicitudesRecientes) {
  const contenedor = document.getElementById('recentRequestsList');
  if (!contenedor || !solicitudesRecientes) return;

  const solicitudesAPI = solicitudesRecientes.filter(req => req.endpoint && req.endpoint.startsWith('/api/'));

  contenedor.innerHTML = '';

  if (solicitudesAPI.length === 0) {
    contenedor.innerHTML = '<div class="text-center text-gray-500 py-4">No hay solicitudes recientes</div>';
    return;
  }

  solicitudesAPI.forEach((req, indice) => {
    const tiempoAgo = Math.floor((Date.now() - req.timestamp) / 1000);
    const tiempoTexto = tiempoAgo < 60 ? `${tiempoAgo}s` : tiempoAgo < 3600 ? `${Math.floor(tiempoAgo / 60)}m` : `${Math.floor(tiempoAgo / 3600)}h`;
    const claseEstado = req.statusCode >= 200 && req.statusCode < 300 ? 'text-emerald-500' : req.statusCode >= 500 ? 'text-red-500' : 'text-yellow-500';

    const div = document.createElement('div');
    div.className = 'recent-request glass-effect p-3 rounded-lg flex items-center justify-between';
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full ${req.statusCode >= 200 && req.statusCode < 300 ? 'bg-emerald-500' : req.statusCode >= 500 ? 'bg-red-500' : 'bg-yellow-500'}"></div>
        <div>
          <div class="text-sm font-medium text-white">${req.method} ${req.endpoint}</div>
          <div class="text-xs text-gray-400">${req.maskedIp} • ${req.userAgent}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm ${claseEstado} font-medium">${req.statusCode}</div>
        <div class="text-xs text-gray-400">${req.duration}ms • ${tiempoTexto}</div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}

function renderizarEstadisticasUserAgent(datosUserAgent) {
  const contenedor = document.getElementById('userAgentStats');
  if (!contenedor || !datosUserAgent) return;

  const agentesOrdenados = Object.entries(datosUserAgent).sort(([, a], [, b]) => b - a).slice(0, 5);
  contenedor.innerHTML = '';

  agentesOrdenados.forEach(([agente, cantidad]) => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 glass-effect rounded-lg';
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="ri-global-line text-blue-400"></i>
        <span class="text-white">${agente}</span>
      </div>
      <span class="text-gray-400">${cantidad.toLocaleString()}</span>
    `;
    contenedor.appendChild(div);
  });
}

function renderizarTablaAPI() {
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const statsPaginadas = statsAPI.slice(inicio, fin);
  const tbody = document.getElementById('apiTableBody');

  if (!tbody) return;

  tbody.innerHTML = '';
  
  statsPaginadas.forEach(([endpoint, datos], indice) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td class="px-4 py-2">${inicio + indice + 1}</td>
      <td class="px-4 py-2">${endpoint.replace(/_/g, '/')}</td>
      <td class="px-4 py-2">${datos.totalRequests.toLocaleString()}</td>
      <td class="px-4 py-2">${datos.success.toLocaleString()}</td>
      <td class="px-4 py-2">${datos.errors.toLocaleString()}</td>
      <td class="px-4 py-2">${datos.avgResponseTime}</td>
      <td class="px-4 py-2">${datos.errorRate}%</td>
      <td class="px-4 py-2">${datos.successRate}%</td>
    `;
    tbody.appendChild(fila);
  });

  const totalPaginas = Math.ceil(statsAPI.length / itemsPorPagina);
  const infoPagina = document.getElementById('pageInfo');
  if (infoPagina) infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  
  const botonPrev = document.getElementById('prevPage');
  const botonNext = document.getElementById('nextPage');
  
  if (botonPrev) botonPrev.disabled = paginaActual === 1;
  if (botonNext) botonNext.disabled = paginaActual === totalPaginas;
}

function actualizarGraficoHistorial(datosDiarios, datosDiariosAPI) {
  const fechas = Object.keys(datosDiarios).slice(-10).map(fecha => new Date(fecha).toLocaleDateString('es-ES'));
  const totalSolicitudes = Object.keys(datosDiarios).slice(-10).map(fecha => datosDiarios[fecha]);
  const solicitudesAPI = Object.keys(datosDiariosAPI).slice(-10).map(fecha => datosDiariosAPI[fecha] || 0);

  graficoHistorial.data.labels = fechas;
  graficoHistorial.data.datasets[0].data = totalSolicitudes;
  graficoHistorial.data.datasets[1].data = solicitudesAPI;
  graficoHistorial.update('none');
}

function actualizarEstadisticas(stats) {
  actualizarTarjetaMetrica('totalRequests', stats.requests.total, statsPrevias.totalRequests);
  statsPrevias.totalRequests = stats.requests.total;

  actualizarTarjetaMetrica('totalEndpoints', stats.system.totalEndpoints, statsPrevias.totalEndpoints);
  statsPrevias.totalEndpoints = stats.system.totalEndpoints;

  actualizarTarjetaMetrica('requestsPerSecond', parseFloat(stats.requests.perSecond), statsPrevias.requestsPerSecond);
  statsPrevias.requestsPerSecond = parseFloat(stats.requests.perSecond);

  actualizarTarjetaMetrica('apiTotalRequests', stats.requests.api.total, statsPrevias.apiTotalRequests);
  statsPrevias.apiTotalRequests = stats.requests.api.total;

  const hoy = new Date().toISOString().split('T')[0];
  const solicitudesDiarias = stats.requests.daily?.[hoy] || 0;
  actualizarTarjetaMetrica('dailyRequests', solicitudesDiarias, statsPrevias.dailyRequests);
  statsPrevias.dailyRequests = solicitudesDiarias;

  const nuevoCPU = parseFloat(stats.system.cpu.usage || 0);
  actualizarTarjetaMetrica('cpuUsage', nuevoCPU, statsPrevias.cpuUsage, '%');
  statsPrevias.cpuUsage = nuevoCPU;

  if (stats.network) {
    const redDown = document.getElementById('networkDown');
    const redUp = document.getElementById('networkUp');
    
    if (redDown) redDown.textContent = stats.network.download.speed || '0 MB/s';
    if (redUp) redUp.textContent = stats.network.upload.speed || '0 KB/s';

    statsPrevias.networkDown = stats.network.download.speedRaw || 0;
    statsPrevias.networkUp = stats.network.upload.speedRaw || 0;
  }

  statsPrevias.memoryUsage = parseFloat(stats.system.memory.usagePercent || 0);

  actualizarDatosTemporales(
    statsPrevias.memoryUsage,
    nuevoCPU,
    stats.requests.perSecond,
    stats.overallAvgResponseTime,
    statsPrevias.networkDown,
    statsPrevias.networkUp
  );

  graficoSistema.data.labels = etiquetasTiempo;
  graficoSistema.data.datasets[0].data = datosMemoria;
  graficoSistema.data.datasets[1].data = datosCPU;
  graficoSistema.update('none');

  graficoSolicitudes.data.labels = etiquetasTiempo;
  graficoSolicitudes.data.datasets[0].data = datosTasaSolicitudes;
  graficoSolicitudes.update('none');

  graficoRespuesta.data.labels = etiquetasTiempo;
  graficoRespuesta.data.datasets[0].data = datosTiempoRespuesta;
  graficoRespuesta.update('none');

  graficoRed.data.labels = etiquetasTiempo;
  graficoRed.data.datasets[0].data = datosDescarga;
  graficoRed.data.datasets[1].data = datosSubida;
  graficoRed.update('none');

  if (stats.requests.daily && stats.requests.api.daily) {
    actualizarGraficoHistorial(stats.requests.daily, stats.requests.api.daily);
  }

  if (stats.enhanced) {
    renderizarSolicitudesRecientes(stats.enhanced.recentRequests);
    renderizarEstadisticasUserAgent(stats.enhanced.topUserAgents);
  }

  statsAPI = Object.entries(stats.apiStats)
    .filter(([_, datos]) => datos.totalRequests > 0)
    .sort((a, b) => b[1].totalRequests - a[1].totalRequests);
  
  renderizarTablaAPI();
}

document.addEventListener('DOMContentLoaded', function() {
  const botonPrev = document.getElementById('prevPage');
  const botonNext = document.getElementById('nextPage');

  if (botonPrev) {
    botonPrev.addEventListener('click', () => {
      if (paginaActual > 1) {
        paginaActual--;
        renderizarTablaAPI();
      }
    });
  }

  if (botonNext) {
    botonNext.addEventListener('click', () => {
      if (paginaActual < Math.ceil(statsAPI.length / itemsPorPagina)) {
        paginaActual++;
        renderizarTablaAPI();
      }
    });
  }

  let timeoutRedimension;
  window.addEventListener('resize', () => {
    clearTimeout(timeoutRedimension);
    timeoutRedimension = setTimeout(() => {
      [graficoSistema, graficoSolicitudes, graficoRespuesta, graficoHistorial, graficoRed].forEach(g => g.resize());
    }, 250);
  });

  document.addEventListener('visibilitychange', () => {
    const graficos = [graficoSistema, graficoSolicitudes, graficoRespuesta, graficoHistorial, graficoRed];
    
    if (document.hidden) {
      graficos.forEach(g => g.stop());
    } else {
      graficos.forEach(g => {
        g.start();
        g.update('none');
      });
    }
  });

  conectarWebSocket();
});