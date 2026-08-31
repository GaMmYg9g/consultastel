// Datos de todas las consultas disponibles con iconos Font Awesome
const consultas = {
    saldo: {
        titulo: "Consultar Saldo",
        descripcion: "Consulta tu saldo actual en tu línea telefónica.",
        icono: "fa-wallet",
        codigo: "*222#",
        necesitaInput: false
    },
    datos: {
        titulo: "¿Cuándo me recargo?",
        descripcion: "Consulta el tiempo restante para tu próxima recarga.",
        icono: "fa-clock",
        codigo: "*222*732#",
        necesitaInput: false
    },
    voz: {
        titulo: "Planes de Voz",
        descripcion: "Consulta los minutos restantes de tu Plan de Voz.",
        icono: "fa-phone",
        codigo: "*222*869#",
        necesitaInput: false
    },
    sms: {
        titulo: "Planes SMS",
        descripcion: "Consulta los SMS restantes de tu Plan de SMS.",
        icono: "fa-sms",
        codigo: "*222*767#",
        necesitaInput: false
    },
    bonos: {
        titulo: "Consultar Bonos",
        descripcion: "Consulta los bonos vigentes en tu línea.",
        icono: "fa-gift",
        codigo: "*222*266#",
        necesitaInput: false
    },
    paquetes: {
        titulo: "Comprar Paquetes",
        descripcion: "Accede al menú para comprar paquetes de datos, voz o SMS.",
        icono: "fa-shopping-cart",
        codigo: "*133#",
        necesitaInput: false
    },
    cliente: {
        titulo: "Atención al Cliente",
        descripcion: "Contacta con el servicio de atención al cliente.",
        icono: "fa-headset",
        codigo: "*2266#",
        necesitaInput: false
    },
    buzon: {
        titulo: "Buzón de Voz",
        descripcion: "Accede a tu buzón de voz para escuchar mensajes.",
        icono: "fa-voicemail",
        codigo: "*123#",
        necesitaInput: false
    },
    transferir: {
        titulo: "Transferir Saldo",
        descripcion: "Transfiere saldo a otro número móvil.",
        icono: "fa-exchange-alt",
        necesitaInput: true,
        inputs: [
            {
                id: "numero",
                label: "Número del receptor:",
                placeholder: "1234567890",
                tipo: "tel"
            },
            {
                id: "clave",
                label: "Clave de envío:",
                placeholder: "1234",
                tipo: "number"
            },
            {
                id: "importe",
                label: "Importe a transferir:",
                placeholder: "10.00",
                tipo: "number",
                step: "0.01"
            }
        ],
        generarCodigo: function(inputs) {
            return `*234*1*${inputs.numero}*${inputs.clave}*${inputs.importe}#`;
        }
    },
    "plan-amigo": {
        titulo: "Plan Amigo",
        descripcion: "Consulta información sobre tu Plan Amigo.",
        icono: "fa-users",
        codigo: "*222*264#",
        necesitaInput: false
    }
};

// Variables globales
let consultaActual = 'saldo';
let inputsValues = {};
let temaActual = 'purple';

// Elementos del DOM
const elementos = {
    consultIcon: document.getElementById('consultIcon'),
    consultTitle: document.getElementById('consultTitle'),
    consultDescription: document.getElementById('consultDescription'),
    codeDisplay: document.getElementById('codeDisplay'),
    actionBtn: document.getElementById('actionBtn'),
    copyBtn: document.getElementById('copyBtn'),
    notification: document.getElementById('notification'),
    inputFields: document.getElementById('inputFields'),
    menuToggle: document.getElementById('menuToggle'),
    themeToggleHeader: document.getElementById('themeToggleHeader'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuItems: document.querySelectorAll('.menu-item'),
    mainContent: document.getElementById('mainContent'),
    themeModal: document.getElementById('themeModal'),
    themeModalClose: document.getElementById('themeModalClose'),
    themeOptions: document.querySelectorAll('.theme-option')
};

// Inicialización
function inicializarApp() {
    cargarTemaGuardado();
    configurarMenu();
    configurarTemas();
    cargarConsulta('saldo');
    
    elementos.actionBtn.addEventListener('click', ejecutarConsulta);
    elementos.copyBtn.addEventListener('click', copiarCodigo);
    
    // Abrir modal de temas desde el header (móvil y escritorio)
    elementos.themeToggleHeader.addEventListener('click', abrirModalTemas);
    
    // Cerrar modal
    elementos.themeModalClose.addEventListener('click', cerrarModalTemas);
    elementos.themeModal.addEventListener('click', function(e) {
        if (e.target === this) cerrarModalTemas();
    });
    
    // Registrar Service Worker (ya está en el HTML)
}

// Abrir modal de temas
function abrirModalTemas() {
    elementos.themeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de temas
function cerrarModalTemas() {
    elementos.themeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Configurar menú lateral
function configurarMenu() {
    elementos.menuToggle.addEventListener('click', toggleMenu);
    elementos.overlay.addEventListener('click', toggleMenu);
    
    elementos.menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const consulta = this.getAttribute('data-consult');
            elementos.menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            cargarConsulta(consulta);
            if (window.innerWidth <= 768) toggleMenu();
        });
    });
}

// Configurar selector de temas (dentro del modal)
function configurarTemas() {
    elementos.themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const tema = this.getAttribute('data-theme');
            cambiarTema(tema);
            elementos.themeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            // Cerrar modal después de seleccionar
            cerrarModalTemas();
        });
    });
}

// Cambiar tema
function cambiarTema(tema) {
    document.body.classList.remove(
        'theme-purple', 'theme-red', 'theme-green',
        'theme-blue', 'theme-dark', 'theme-light'
    );
    document.body.classList.add(`theme-${tema}`);
    temaActual = tema;
    
    // Actualizar color de tema para PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        const colors = {
            purple: '#6a11cb',
            red: '#ff416c',
            green: '#11998e',
            blue: '#36d1dc',
            dark: '#1a202c',
            light: '#3498db'
        };
        metaThemeColor.setAttribute('content', colors[tema] || '#6a11cb');
    }
    
    guardarPreferenciaTema(tema);
    mostrarNotificacion(`Tema cambiado a ${tema}`, 'success');
}

function guardarPreferenciaTema(tema) {
    try { localStorage.setItem('tema', tema); } catch (e) {}
}

function cargarTemaGuardado() {
    try {
        const temaGuardado = localStorage.getItem('tema');
        if (temaGuardado) {
            cambiarTema(temaGuardado);
            // Marcar el tema activo en el modal
            elementos.themeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === temaGuardado) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
    } catch (e) {}
}

// Toggle del menú lateral
function toggleMenu() {
    elementos.sidebar.classList.toggle('active');
    elementos.overlay.classList.toggle('active');
    document.body.style.overflow = elementos.sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

// Cargar una consulta específica
function cargarConsulta(consultaId) {
    consultaActual = consultaId;
    const consulta = consultas[consultaId];
    
    // Actualizar icono
    elementos.consultIcon.innerHTML = `<i class="fas ${consulta.icono}"></i>`;
    elementos.consultTitle.textContent = consulta.titulo;
    elementos.consultDescription.textContent = consulta.descripcion;
    
    // Botón de acción
    if (consultaId === 'transferir') {
        elementos.actionBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Transferir Saldo';
    } else {
        const palabras = consulta.titulo.split(' ');
        const ultimaPalabra = palabras[palabras.length - 1];
        elementos.actionBtn.innerHTML = `<i class="fas fa-phone"></i> Consultar ${ultimaPalabra}`;
    }
    
    inputsValues = {};
    
    if (consulta.necesitaInput && consulta.inputs) {
        mostrarInputs(consulta.inputs);
        elementos.codeDisplay.textContent = 'Complete los campos arriba';
    } else {
        elementos.inputFields.innerHTML = '';
        elementos.codeDisplay.textContent = consulta.codigo;
    }
    
    elementos.notification.style.display = 'none';
}

// Mostrar campos de entrada
function mostrarInputs(inputs) {
    elementos.inputFields.innerHTML = '';
    
    inputs.forEach(input => {
        const div = document.createElement('div');
        div.className = 'input-group';
        
        const label = document.createElement('label');
        label.className = 'input-label';
        label.innerHTML = `<i class="fas fa-${input.id === 'numero' ? 'mobile-alt' : input.id === 'clave' ? 'key' : 'coins'}"></i> ${input.label}`;
        label.htmlFor = input.id;
        
        const field = document.createElement('input');
        field.type = input.tipo || 'text';
        field.id = input.id;
        field.className = 'input-field';
        field.placeholder = input.placeholder || '';
        if (input.maxlength) field.maxLength = input.maxlength;
        if (input.minlength) field.minLength = input.minlength;
        if (input.step) field.step = input.step;
        
        field.addEventListener('input', function() {
            let value = this.value;
            if (input.id === 'numero') {
                value = value.replace(/\D/g, '');
                this.value = value;
            }
            if (input.id === 'clave') {
                value = value.replace(/\D/g, '').slice(0, 4);
                this.value = value;
            }
            if (input.id === 'importe') {
                value = value.replace(/[^0-9.]/g, '');
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                if (parts[1] && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
                this.value = value;
            }
            inputsValues[input.id] = this.value;
            actualizarCodigoDinamico();
        });
        
        div.appendChild(label);
        div.appendChild(field);
        elementos.inputFields.appendChild(div);
    });
}

// Actualizar código dinámico
function actualizarCodigoDinamico() {
    const consulta = consultas[consultaActual];
    if (consulta.necesitaInput && consulta.generarCodigo) {
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        if (todosCompletos) {
            elementos.codeDisplay.textContent = consulta.generarCodigo(inputsValues);
        } else {
            elementos.codeDisplay.textContent = 'Complete los campos arriba';
        }
    }
}

// Ejecutar consulta (marcar número)
function ejecutarConsulta() {
    const consulta = consultas[consultaActual];
    let codigo = '';
    
    if (consulta.necesitaInput && consulta.generarCodigo) {
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        if (!todosCompletos) {
            mostrarNotificacion('Por favor, complete todos los campos.', 'error');
            return;
        }
        
        if (consultaActual === 'transferir') {
            const importe = parseFloat(inputsValues['importe']);
            if (isNaN(importe) || importe <= 0) {
                mostrarNotificacion('Ingrese un importe válido mayor a 0.', 'error');
                return;
            }
            const clave = inputsValues['clave'];
            if (!/^\d+$/.test(clave) || clave.length < 4) {
                mostrarNotificacion('La clave debe tener al menos 4 dígitos numéricos.', 'error');
                return;
            }
            const numero = inputsValues['numero'].replace(/\D/g, '');
            if (numero.length < 10) {
                mostrarNotificacion('El número debe tener al menos 10 dígitos.', 'error');
                return;
            }
            inputsValues['numero'] = numero;
        }
        
        codigo = consulta.generarCodigo(inputsValues);
    } else {
        codigo = consulta.codigo;
    }
    
    const codigoCodificado = codigo.replace('#', '%23');
    mostrarNotificacion('Redirigiendo a la aplicación de llamadas...', 'success');
    
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const telLink = document.createElement('a');
        telLink.href = `tel:${codigoCodificado}`;
        telLink.click();
    } else {
        mostrarNotificacion(
            `En un dispositivo móvil, esto abriría la aplicación de llamadas con:<br><strong>${codigo}</strong><br><br>En escritorio, copia el código y márcalo manualmente.`,
            'info'
        );
    }
    
    const originalText = elementos.actionBtn.innerHTML;
    elementos.actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Marcando...';
    elementos.actionBtn.disabled = true;
    
    setTimeout(() => {
        elementos.actionBtn.innerHTML = originalText;
        elementos.actionBtn.disabled = false;
    }, 3000);
}

// Copiar código
function copiarCodigo() {
    const consulta = consultas[consultaActual];
    let codigo = '';
    
    if (consulta.necesitaInput && consulta.generarCodigo) {
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        if (!todosCompletos) {
            mostrarNotificacion('Complete los campos antes de copiar el código.', 'error');
            return;
        }
        codigo = consulta.generarCodigo(inputsValues);
    } else {
        codigo = consulta.codigo;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codigo)
            .then(() => mostrarNotificacion('Código copiado al portapapeles: ' + codigo, 'success'))
            .catch(() => copiarFallback(codigo));
    } else {
        copiarFallback(codigo);
    }
}

function copiarFallback(codigo) {
    const textArea = document.createElement('textarea');
    textArea.value = codigo;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        mostrarNotificacion('Código copiado al portapapeles: ' + codigo, 'success');
    } catch (err) {
        mostrarNotificacion('No se pudo copiar el código. Selecciona manualmente.', 'error');
    }
    document.body.removeChild(textArea);
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    elementos.notification.innerHTML = `<i class="fas ${iconMap[tipo] || 'fa-info-circle'}"></i> ${mensaje}`;
    elementos.notification.className = `notification ${tipo}`;
    elementos.notification.style.display = 'block';
    
    setTimeout(() => {
        elementos.notification.style.display = 'none';
    }, 5000);
}

// Iniciar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', inicializarApp);

// Cerrar menú al redimensionar
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        elementos.sidebar.classList.remove('active');
        elementos.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
