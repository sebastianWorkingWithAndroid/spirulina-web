document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. GESTIÓN DEL TEMA (DARK / LIGHT)
  // ==========================================
  const themeToggleBtn = document.querySelector('.theme-toggle');
  const htmlElement = document.documentElement;
  
  // Revisar preferencia guardada o del sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else {
    htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });


  // ==========================================
  // 2. SISTEMA DE TABS (PESTAÑAS ANIMADAS)
  // ==========================================
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const indicator = document.querySelector('.tab-indicator');
  const tabContainer = document.querySelector('.tab-buttons');

  function updateIndicator(activeTab) {
    if (!activeTab || !indicator) return;
    // Cálculos para mover la barrita de color
    const left = activeTab.offsetLeft;
    const width = activeTab.offsetWidth;
    indicator.style.setProperty('--x', `${left}px`);
    indicator.style.setProperty('--w', `${width}px`);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Quitar activo a todos
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // 2. Activar actual
      tab.classList.add('active');
      const target = document.querySelector(tab.dataset.target);
      if (target) {
        target.classList.add('active');
        // Pequeño fix para reiniciar animaciones dentro del tab si es necesario
        target.classList.remove('reveal');
        void target.offsetWidth; // trigger reflow
        target.classList.add('reveal', 'is-visible');
      }

      // 3. Mover indicador
      updateIndicator(tab);
    });
  });

  // Inicializar indicador en la primera carga
  const activeTab = document.querySelector('.tab-btn.active');
  // Pequeño timeout para asegurar que el DOM cargó estilos
  setTimeout(() => updateIndicator(activeTab), 100);
  
  // Actualizar al redimensionar ventana
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.tab-btn.active');
    updateIndicator(currentActive);
  });


  // ==========================================
  // 3. SCROLL REVEAL (ANIMACIÓN AL APARECER)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Dejar de observar una vez animado (opcional, quita la línea si quieres que se repita)
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Se activa al ver el 15% del elemento
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ==========================================
  // 4. EFECTO TILT 3D (TARJETAS)
  // ==========================================
  const tiltElements = document.querySelectorAll('.tilt');

  tiltElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calcular rotación (centro es 0,0)
      const xPct = (x / rect.width) - 0.5;
      const yPct = (y / rect.height) - 0.5;

      // Multiplicadores de intensidad
      const rX = yPct * -20; // Rotación eje X
      const rY = xPct * 20;  // Rotación eje Y

      card.style.transform = `
        perspective(1000px)
        rotateX(${rX}deg)
        rotateY(${rY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
    });
  });


  // ==========================================
  // 5. SCROLL PROGRESS & STEPPER ACTIVO
  // ==========================================
  const scrollbar = document.querySelector('.scrollbar');
  const stepperProgress = document.querySelector('.stepper-progress');
  
  window.addEventListener('scroll', () => {
    // A. Barra superior
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (scrollbar) {
      scrollbar.style.width = `${scrollPercent}%`;
    }

    // B. Progreso de los pasos (Stepper horizontal)
    // Esto es un cálculo aproximado basado en la sección de pasos
    const processSection = document.getElementById('proceso');
    if (processSection) {
      const sectionTop = processSection.offsetTop;
      const sectionHeight = processSection.offsetHeight;
      const scrollRel = scrollTop - sectionTop + (window.innerHeight / 2);
      
      let stepPercent = (scrollRel / sectionHeight) * 100;
      // Limites 0 - 100
      stepPercent = Math.max(0, Math.min(100, stepPercent));
      
      if (stepperProgress) {
        stepperProgress.style.setProperty('--progress', `${stepPercent}%`);
      }
    }
  });

});

// ==========================================
// 6. HELPER: SCROLL TO STEP (Global)
// ==========================================
window.scrollToStep = function(id) {
  const el = document.getElementById(id);
  if (el) {
    // Scroll suave y centrado
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Activar visualmente el botón del stepper (opcional visual)
    // Nota: Esto es solo visual momentáneo, la lógica real requeriría IntersectionObserver complejo
    const btns = document.querySelectorAll('.stepper-item');
    btns.forEach(b => b.classList.remove('active'));
    // Busca el botón que llamó a esta función (esto es un truco simple)
    const activeBtn = document.querySelector(`button[onclick="scrollToStep('${id}')"]`);
    if(activeBtn) activeBtn.parentElement.classList.add('active');
  }
};


// ==========================================
// 7. INTEGRACIÓN CMS (CARGA DINÁMICA)
// ==========================================
(async function loadCMS() {
  console.log('🔄 Iniciando carga del CMS...');
  
  try {
    // 1. Intentamos obtener el JSON
    // El cache: 'no-store' es vital para ver cambios al instante
    const response = await fetch('datos/contenido.json', { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    // Si el JSON está vacío (primera vez), no hacemos nada
    if (Object.keys(data).length === 0) {
      console.log('⚠️ El archivo contenido.json está vacío. Usando contenido por defecto.');
      return;
    }

    // Helper para asignar texto si existe el elemento
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.innerText = text;
    };

    // --- A. CARGAR HERO ---
    if (data.hero) {
      setText('hero-title', data.hero.titulo);
      setText('hero-subtitle', data.hero.subtitulo);
      setText('hero-desc', data.hero.descripcion);
      
      if (data.hero.imagen) {
        const imgHero = document.getElementById('hero-img');
        if (imgHero) {
            // Netlify CMS guarda rutas como "image/uploads/foto.jpg"
            // A veces necesitamos ajustar la ruta relativa si es necesario
            imgHero.src = data.hero.imagen; 
        }
      }
    }

    // --- B. CARGAR TABS (RESUMEN) ---
    if (data.info_tabs && data.info_tabs.resumen) {
      setText('resumen-title', data.info_tabs.resumen.titulo);
      setText('resumen-text', data.info_tabs.resumen.texto);
    }

    // --- C. CARGAR LISTAS (MATERIALES Y NOTAS) ---
    const updateList = (idList, arrayData, key) => {
      const listEl = document.getElementById(idList);
      if (listEl && arrayData && arrayData.length > 0) {
        listEl.innerHTML = ''; // Limpiar lista hardcodeada
        arrayData.forEach(obj => {
          const li = document.createElement('li');
          // Manejar si el CMS devuelve string simple o objeto
          li.textContent = (typeof obj === 'object' && obj[key]) ? obj[key] : obj;
          listEl.appendChild(li);
        });
      }
    };

    if (data.info_tabs) {
      updateList('materiales-list', data.info_tabs.materiales, 'item');
      updateList('notas-list', data.info_tabs.notas, 'nota');
    }

    // --- D. CARGAR PASOS (1 AL 5) ---
    if (data.pasos_lista && data.pasos_lista.length > 0) {
      data.pasos_lista.forEach((pasoData, index) => {
        // IDs esperados: paso-1, paso-2, etc.
        const pasoID = `paso-${index + 1}`;
        const pasoEl = document.getElementById(pasoID);

        if (pasoEl) {
          // Título y Descripción Header
          const tituloEl = pasoEl.querySelector('.step-header h3');
          const descEl = pasoEl.querySelector('.step-header .muted');
          
          if (tituloEl && pasoData.titulo) tituloEl.innerText = pasoData.titulo;
          if (descEl && pasoData.descripcion) descEl.innerText = pasoData.descripcion;

          // Checklist
          const ul = pasoEl.querySelector('.checklist');
          if (ul && pasoData.tareas && pasoData.tareas.length > 0) {
            ul.innerHTML = '';
            pasoData.tareas.forEach(t => {
              const li = document.createElement('li');
              li.textContent = (typeof t === 'object' && t.tarea) ? t.tarea : t; 
              ul.appendChild(li);
            });
          }

          // Tip / Sugerencia
          const hintEl = pasoEl.querySelector('.step-hint');
          if (hintEl) {
            if (pasoData.tip) {
              hintEl.style.display = 'block';
              hintEl.innerHTML = `<strong>Nota:</strong> ${pasoData.tip}`;
            } else {
              hintEl.style.display = 'none'; // Ocultar si no hay tip
            }
          }
        }
      });
    }

    console.log('✅ Contenido CMS cargado correctamente.');

  } catch (error) {
    console.warn('ℹ️ No se pudo cargar contenido.json (es normal si es la primera vez o estás en local sin generar el archivo).', error);
  }
})();