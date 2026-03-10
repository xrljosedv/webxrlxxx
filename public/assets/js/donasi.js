let widgetTurnstile;

window.onloadTurnstileCallback = function() {
  const contenedor = document.querySelector('.cf-turnstile');
  if (contenedor && typeof turnstile !== 'undefined') {
    widgetTurnstile = turnstile.render(contenedor, {
      sitekey: '0x4AAAAAAA6dZGHl6b5dKTOR',
      theme: 'dark',
    });
  }
};

async function notificarBackend(resultado) {
  try {
    await fetch('/api/donasi/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: resultado.order_id,
        transaction_status: resultado.status_code === '200' ? 'settlement' : resultado.status_code === '201' ? 'pending' : 'failed',
        gross_amount: resultado.gross_amount,
        signature_key: resultado.signature_key || ''
      })
    });
  } catch (error) {
    console.error('Error notificando al backend:', error);
  }
}

async function obtenerListaDonaciones() {
  try {
    const respuesta = await fetch('/api/donasi/list');
    const datos = await respuesta.json();
    
    if (datos.status && datos.donations.length > 0) {
      const listaDonaciones = document.getElementById('donation-list');
      if (!listaDonaciones) return;
      
      listaDonaciones.innerHTML = '';
      
      const donacionesOrdenadas = datos.donations
        .filter(d => d.status === 'success')
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      
      donacionesOrdenadas.forEach(donacion => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'donation-card p-4 rounded-2xl glass-effect';
        tarjeta.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span class="text-white font-medium">${donacion.name.charAt(0)}</span>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-white">${donacion.name}</h4>
              <p class="text-gray-400 text-sm">Rp ${Number(donacion.amount).toLocaleString('id-ID')}</p>
              <p class="text-gray-500 text-xs">${donacion.comment || 'Sin comentario'}</p>
            </div>
          </div>
        `;
        listaDonaciones.appendChild(tarjeta);
      });
    }
  } catch (error) {
    console.error('Error obteniendo lista de donaciones:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  obtenerListaDonaciones();

  const formulario = document.getElementById('donation-form');
  
  if (formulario) {
    formulario.addEventListener('submit', async e => {
      e.preventDefault();

      const tokenRespuesta = document.querySelector('.cf-turnstile input[name="cf-turnstile-response"]')?.value;

      if (!tokenRespuesta) {
        alert('Por favor complete la verificación de seguridad');
        return;
      }

      const datosFormulario = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        amount: Number(document.getElementById('amount').value),
        comment: document.getElementById('comment').value.trim(),
        turnstileToken: tokenRespuesta
      };

      try {
        const respuesta = await fetch('/api/donasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosFormulario)
        });

        const datos = await respuesta.json();

        if (datos.status && typeof snap !== 'undefined') {
          snap.pay(datos.token, {
            onSuccess: async resultado => {
              await notificarBackend(resultado);
              alert('¡Gracias por su donación!');
              obtenerListaDonaciones();
            },
            onPending: async resultado => {
              await notificarBackend(resultado);
              alert('Su pago está siendo procesado. Por favor complete en 24 horas.');
            },
            onError: async resultado => {
              await notificarBackend(resultado);
              alert('El pago falló. Por favor intente nuevamente.');
            },
            onClose: () => {
              console.log('Ventana de pago cerrada');
            }
          });
        } else {
          alert(datos.error || 'Error al crear la transacción de donación');
        }
      } catch (error) {
        console.error('Error enviando donación:', error);
        alert('Error al procesar la donación. Intente nuevamente.');
      }
    });
  }
});