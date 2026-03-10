document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    
    if (toggle) {
      toggle.addEventListener('click', () => {
        item.classList.toggle('active');
        
        if (item.classList.contains('active')) {
          toggle.textContent = '×';
        } else {
          toggle.textContent = '+';
        }
      });
    }
  });

  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
      easing: 'ease-out-cubic'
    });
  }

  const currentYear = new Date().getFullYear();
  const yearElements = document.querySelectorAll('.current-year');
  
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });

  function actualizarHora() {
    const timeElements = document.querySelectorAll('.current-time');
    const ahora = new Date().toLocaleTimeString('es-ES');
    
    timeElements.forEach(el => {
      el.textContent = ahora;
    });
  }

  actualizarHora();
  setInterval(actualizarHora, 1000);

  const tooltips = document.querySelectorAll('[data-tooltip]');
  
  tooltips.forEach(el => {
    el.addEventListener('mouseenter', function(e) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.dataset.tooltip;
      tooltip.style.position = 'absolute';
      tooltip.style.background = '#1e293b';
      tooltip.style.color = '#e2e8f0';
      tooltip.style.padding = '4px 8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.zIndex = '1000';
      tooltip.style.border = '1px solid #334155';
      
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      
      this._tooltip = tooltip;
    });
    
    el.addEventListener('mouseleave', function() {
      if (this._tooltip) {
        this._tooltip.remove();
        delete this._tooltip;
      }
    });
  });
});