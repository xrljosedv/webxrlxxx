const contribuyentes = [
  {
    name: 'xrljosedv',
    role: 'Creador',
    image: '',
    bio: 'Creador y desarrollador principal de Xrimuix Apis.',
    skills: ['JavaScript', 'Node.js', 'Express', 'API Design'],
  },
  {
    name: 'Siputzx',
    role: 'Colaborador',
    image: '',
    bio: 'Contribuye con ideas y mejoras para el proyecto.',
    skills: ['Marketing', 'Leadership'],
  },
  {
    name: 'Refly Mukudori',
    role: 'Colaborador',
    image: '',
    bio: 'Especialista en Cloudflare y mitigación DDoS.',
    skills: ['Cloudflare', 'DDoS Mitigation', 'Networking', 'Security'],
  },
  {
    name: 'Yanzdev',
    role: 'Colaborador',
    image: '',
    bio: 'Contribuye con scrapers para la API.',
    skills: ['Web Scraping', 'JavaScript', 'Automation'],
  },
  {
    name: 'Daffa',
    role: 'Colaborador',
    image: '',
    bio: 'Contribuye con scrapers para la API.',
    skills: ['Web Scraping', 'Node.js'],
  }
];

function obtenerIniciales(nombre) {
  return nombre
    .split(' ')
    .map(palabra => palabra[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function crearTarjetaContribuyente(contribuyente, indice) {
  const tieneImagen = contribuyente.image && contribuyente.image.length > 0;
  const iniciales = obtenerIniciales(contribuyente.name);

  return `
    <div class="glass-card rounded-xl animate-fade" 
         style="animation-delay: ${indice * 100}ms">
      <div class="p-6">
        <div class="flex flex-col items-center text-center">
          <div class="profile-container mb-4">
            ${tieneImagen 
              ? `<img src="${contribuyente.image}" alt="${contribuyente.name}" class="profile-image">`
              : `<div class="profile-initials">${iniciales}</div>`
            }
          </div>
          
          <h3 class="text-xl font-semibold text-white mb-1">${contribuyente.name}</h3>
          <p class="text-sm text-indigo-400 mb-3 tracking-wide">${contribuyente.role}</p>
          <p class="text-gray-400 text-sm mb-4 leading-relaxed">${contribuyente.bio}</p>
          
          <div class="flex flex-wrap justify-center gap-2">
            ${contribuyente.skills.map(skill => `
              <span class="skill-tag text-xs px-3 py-1 rounded-full">
                ${skill}
              </span>
            `).join('')}
          </div>                        
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('contributors-grid');
  
  if (grid) {
    grid.innerHTML = contribuyentes
      .map((contribuyente, indice) => crearTarjetaContribuyente(contribuyente, indice))
      .join('');
  }
});