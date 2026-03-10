const camposDinamicos = {
  feature: `
    <div class="input-group">
      <label for="featureName">Nombre de la Característica</label>
      <input type="text" id="featureName" required placeholder="Nombre de la característica que solicita" />
    </div>
    <div class="input-group">
      <label for="description">Descripción</label>
      <textarea id="description" required placeholder="Describa la característica que le gustaría ver..." rows="4"></textarea>
    </div>
  `,
  complaint: `
    <div class="input-group">
      <label for="featureName">Característica de la API</label>
      <input type="text" id="featureName" required placeholder="¿Qué característica de la API tiene problemas?" />
    </div>
    <div class="input-group">
      <label for="description">Detalles del Problema</label>
      <textarea id="description" required placeholder="Describa el problema que está experimentando..." rows="4"></textarea>
    </div>
  `,
  feedback: `
    <div class="input-group">
      <label for="description">Comentarios</label>
      <textarea id="description" required placeholder="Comparta sus comentarios con nosotros..." rows="4"></textarea>
    </div>
  `,
};

let widgetTurnstile;

window.onloadTurnstileCallback = function() {
  const contenedor = document.getElementById('turnstile-container');
  if (contenedor && typeof turnstile !== 'undefined') {
    widgetTurnstile = turnstile.render(contenedor, {
      sitekey: '0x4AAAAAAA6dZGHl6b5dKTOR',
      theme: 'dark',
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const selectTipo = document.getElementById('requestType');
  const contenedorDinamico = document.getElementById('dynamicFields');

  if (selectTipo && contenedorDinamico) {
    selectTipo.addEventListener('change', function(e) {
      const tipo = e.target.value;
      contenedorDinamico.innerHTML = tipo ? camposDinamicos[tipo] : '';
    });
  }

  const formulario = document.getElementById('supportForm');

  if (formulario) {
    formulario.addEventListener('submit', async e => {
      e.preventDefault();

      if (!widgetTurnstile || typeof turnstile === 'undefined') {
        Swal.fire({
          text: 'Error con la verificación de seguridad',
          icon: 'error',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      const token = turnstile.getResponse(widgetTurnstile);

      if (!token) {
        Swal.fire({
          text: 'Por favor complete la verificación',
          icon: 'info',
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }

      try {
        Swal.fire({
          text: 'Enviando...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        });

        const datosFormulario = {
          type: document.getElementById('requestType').value,
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          whatsapp: document.getElementById('whatsapp').value || null,
          featureName: document.getElementById('featureName')?.value,
          description: document.getElementById('description')?.value,
          token,
        };

        const respuesta = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosFormulario),
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
          Swal.fire({
            text: '¡Enviado correctamente!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          });
          
          formulario.reset();
          
          if (contenedorDinamico) contenedorDinamico.innerHTML = '';
          
          if (widgetTurnstile && typeof turnstile !== 'undefined') {
            turnstile.reset(widgetTurnstile);
          }
        } else {
          throw new Error(resultado.error || 'Error al enviar');
        }
      } catch (error) {
        Swal.fire({
          text: error.message,
          icon: 'error',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }
});