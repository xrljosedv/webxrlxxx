window.onload = function() {
  const modoOscuro = true;

  const ui = SwaggerUIBundle({
    url: '/api/listar',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 0,
    displayRequestDuration: false,
    filter: false,
    operationsSorter: (a, b) => a.get('path').localeCompare(b.get('path')),
    tagsSorter: 'alpha',
    validatorUrl: null,
    onComplete: function() {
      Swal.fire({
        title: 'API Desarrollada por xrljosedv',
        html: `
          <p>Xrimuix Apis - Documentación GET</p>
          <p>Creado por: <b>xrljosedv</b></p>
        `,
        background: modoOscuro ? '#1F2937' : '#FFFFFF',
        color: modoOscuro ? '#FFFFFF' : '#000000',
        confirmButtonText: 'Ver Documentación',
        confirmButtonColor: '#0EA5E9',
        showCloseButton: true
      });

      const layoutTop = document.createElement('div');
      layoutTop.className = 'top-layout';

      const contenedorBusqueda = document.createElement('div');
      contenedorBusqueda.className = 'custom-search-container';
      contenedorBusqueda.innerHTML = `
        <input type="text" id="custom-search-input" placeholder="Buscar endpoint...">
        <div class="search-results-info" id="search-results-info"></div>
      `;

      layoutTop.appendChild(contenedorBusqueda);
      
      const contenedorScheme = document.querySelector('.scheme-container');
      if (contenedorScheme) {
        layoutTop.appendChild(contenedorScheme);
      }

      const infoElement = document.querySelector('.information-container');
      infoElement.after(layoutTop);

      const inputBusqueda = document.getElementById('custom-search-input');

      inputBusqueda.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase();

        document.querySelectorAll('.opblock-tag').forEach(tag => {
          let tieneVisible = false;
          let totalOps = 0;
          let visiblesOps = 0;

          tag.nextElementSibling.querySelectorAll('.opblock').forEach(op => {
            totalOps++;

            const path = op.querySelector('.opblock-summary-path')?.textContent?.toLowerCase() || '';
            const method = op.querySelector('.opblock-summary-method')?.textContent?.toLowerCase() || '';
            const summary = op.getAttribute('data-summary') || '';

            const esVisible = termino === '' ||
              path.includes(termino) ||
              method.includes(termino) ||
              summary.toLowerCase().includes(termino);

            op.style.display = esVisible ? 'block' : 'none';

            if (esVisible) {
              tieneVisible = true;
              visiblesOps++;
            }
          });

          tag.style.display = tieneVisible ? 'block' : 'none';
          tag.nextElementSibling.style.display = tieneVisible ? 'block' : 'none';

          if (termino && tieneVisible) {
            const textoTag = tag.textContent.split('(')[0].trim();
            tag.querySelector('span').textContent = `${textoTag} (${visiblesOps}/${totalOps})`;
          } else if (!termino) {
            const textoTag = tag.textContent.split('(')[0].trim();
            tag.querySelector('span').textContent = textoTag;
          }
        });
      });

      document.querySelectorAll('.opblock').forEach(op => {
        const summary = op.querySelector('.opblock-summary-description')?.textContent || '';
        op.setAttribute('data-summary', summary);
      });

      inputBusqueda.focus();

      function removerInfoVersion() {
        const elementos = document.querySelectorAll('pre.version');
        const visitados = new Set();

        elementos.forEach(el => {
          const padre = el.closest('span');
          if (padre && !visitados.has(padre)) {
            const contador = padre.querySelectorAll('pre.version').length;
            if (contador >= 2) {
              padre.remove();
            } else {
              el.remove();
            }
            visitados.add(padre);
          } else if (!padre) {
            el.remove();
          }
        });
      }

      removerInfoVersion();
    }
  });

  window.ui = ui;
};