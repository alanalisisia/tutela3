// ===== VARIABLES GLOBALES =====
let datosGlobales = {};
let charts = {};

// ===== CONFIGURACIÓN DE COLORES VIVOS =====
const colores = {
    // Colores principales vibrantes
    azul_vibrante: '#3b82f6',
    naranja_vibrante: '#f59e0b',
    verde_vibrante: '#10b981',
    rojo_vibrante: '#ef4444',
    cian_vibrante: '#06b6d4',
    purpura_vibrante: '#8b5cf6',
    rosa_vibrante: '#ec4899',
    amarillo_vibrante: '#f59e0b',
    
    // Paleta de colores vibrantes para gráficos
    paleta_vibrante: [
        '#3b82f6', // Azul vibrante
        '#f59e0b', // Naranja vibrante
        '#10b981', // Verde vibrante
        '#ef4444', // Rojo vibrante
        '#06b6d4', // Cian vibrante
        '#8b5cf6', // Púrpura vibrante
        '#ec4899', // Rosa vibrante
        '#f59e0b', // Amarillo vibrante
        '#84cc16', // Verde lima vibrante
        '#f97316', // Naranja rojizo vibrante
        '#06b6d4', // Cian azulado vibrante
        '#a855f7'  // Violeta vibrante
    ],
    
    // Colores pasteles vibrantes
    pasteles_vibrantes: [
        '#a7f3d0', // Verde pastel vibrante
        '#fef08a', // Amarillo pastel vibrante
        '#bfdbfe', // Azul pastel vibrante
        '#ddd6fe', // Lila pastel vibrante
        '#fbcfe8', // Rosa pastel vibrante
        '#fed7aa', // Naranja pastel vibrante
        '#fecaca', // Rojo pastel vibrante
        '#a5f3fc', // Cian pastel vibrante
        '#bbf7d0', // Verde claro vibrante
        '#fef3c7', // Amarillo claro vibrante
        '#dbeafe', // Azul claro vibrante
        '#e9d5ff'  // Púrpura claro vibrante
    ]
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando dashboard con colores vibrantes...');
    
    // Inicializar navegación
    initNavigation();
    
    // Cargar datos
    loadData();
    
    // Inicializar formulario de contacto
    initContactForm();
});

// ===== NAVEGACIÓN =====
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar la sección correspondiente
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ===== CARGA DE DATOS =====
async function loadData() {
    try {
        console.log('📊 Cargando datos...');
        
        // Cargar todos los archivos JSON
        const dataFiles = [
            'datos.json',
            'resumen_kpi.json',
            'por_mes.json',
            'por_departamento.json',
            'por_tipo.json',
            'por_estado.json',
            'por_resultado.json',
            'por_tutela.json',
            'analisis_sexo.json',
            'resumen_estadistico.json'
        ];
        
        const promises = dataFiles.map(file => 
            fetch(`data/${file}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.warn(`⚠️ Error cargando ${file}:`, error);
                    return null;
                })
        );
        
        const results = await Promise.all(promises);
        
        // Asignar datos a variables globales
        datosGlobales = {
            datos: results[0] || [],
            resumen_kpi: results[1] || [],
            por_mes: results[2] || [],
            por_departamento: results[3] || [],
            por_tipo: results[4] || [],
            por_estado: results[5] || [],
            por_resultado: results[6] || [],
            por_tutela: results[7] || [],
            analisis_sexo: results[8] || [],
            resumen_estadistico: results[9] || {}
        };
        
        console.log('✅ Datos cargados exitosamente');
        
        // Inicializar dashboard
        initDashboard();
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        showError('Error cargando los datos del dashboard');
    }
}

// ===== INICIALIZACIÓN DEL DASHBOARD =====
function initDashboard() {
    // Actualizar KPIs
    updateKPIs();
    
    // Crear gráficos
    createCharts();
    
    // Inicializar tabla
    initDataTable();
    
    // Inicializar filtros
    initFilters();
}

// ===== ACTUALIZACIÓN DE KPIs =====
function updateKPIs() {
    try {
        const resumen = datosGlobales.resumen_estadistico;
        const datos = datosGlobales.datos;
        const porEstado = datosGlobales.por_estado;
        const porResultado = datosGlobales.por_resultado;
        const porTutela = datosGlobales.por_tutela;
        
        // Calcular KPIs usando los datos de resumen
        const totalRegistros = resumen.total_registros || datos.length || 0;
        
        // En término desde por_estado
        const enTerminoData = porEstado.find(item => item['Estado (término)'] === 'En término');
        const enTermino = enTerminoData ? enTerminoData.Total : 0;
        
        // Resueltos desde por_resultado
        const resueltosData = porResultado.find(item => item.Resultado === 'Resuelto');
        const resueltos = resueltosData ? resueltosData.Total : 0;
        
        // Con tutela desde por_tutela
        const conTutelaData = porTutela.find(item => item.Tutela === 'Sí');
        const conTutela = conTutelaData ? conTutelaData.Total : 0;
        
        // Actualizar elementos en el DOM
        const totalElement = document.getElementById('total-registros');
        const enTerminoElement = document.getElementById('en-termino');
        const resueltosElement = document.getElementById('resueltos');
        const conTutelaElement = document.getElementById('con-tutela');
        
        if (totalElement) totalElement.textContent = totalRegistros.toLocaleString();
        if (enTerminoElement) enTerminoElement.textContent = enTermino.toLocaleString();
        if (resueltosElement) resueltosElement.textContent = resueltos.toLocaleString();
        if (conTutelaElement) conTutelaElement.textContent = conTutela.toLocaleString();
        
    } catch (error) {
        console.error('Error actualizando KPIs:', error);
    }
}

// ===== CREACIÓN DE GRÁFICOS =====
function createCharts() {
    // Gráfico por Mes
    createChartMes();
    
    // Gráfico por Departamento
    createChartDepartamento();
    
    // Gráfico por Tipo
    createChartTipo();
    
    // Gráfico por Estado
    createChartEstado();
    
    // Gráfico por Resultado
    createChartResultado();
    
    // Gráfico por Tutela
    createChartTutela();
}

function createChartMes() {
    const ctx = document.getElementById('chartMes');
    if (!ctx) return;
    
    const data = datosGlobales.por_mes;
    if (!data || data.length === 0) return;
    
    const labels = data.map(item => item['Año-Mes']);
    const totales = data.map(item => item.Total);
    const enTermino = data.map(item => item.En_término);
    
    charts.mes = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total',
                    data: totales,
                    borderColor: colores.azul_vibrante,
                    backgroundColor: colores.pasteles_vibrantes[2],
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'En Término',
                    data: enTermino,
                    borderColor: colores.verde_vibrante,
                    backgroundColor: colores.pasteles_vibrantes[0],
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function createChartDepartamento() {
    const ctx = document.getElementById('chartDepartamento');
    if (!ctx) return;
    
    const data = datosGlobales.por_departamento;
    if (!data || data.length === 0) return;
    
    const labels = data.map(item => item.Departamento);
    const totales = data.map(item => item.Total);
    
    charts.departamento = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total por Departamento',
                data: totales,
                backgroundColor: colores.paleta_vibrante,
                borderColor: colores.azul_vibrante,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function createChartTipo() {
    const ctx = document.getElementById('chartTipo');
    if (!ctx) return;
    
    const data = datosGlobales.por_tipo;
    if (!data || data.length === 0) return;
    
    const labels = data.map(item => item['Tipo de solicitud']);
    const totales = data.map(item => item.Total);
    
    charts.tipo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: totales,
                backgroundColor: colores.paleta_vibrante,
                borderColor: colores.azul_vibrante,
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

function createChartEstado() {
    const ctx = document.getElementById('chartEstado');
    if (!ctx) return;
    
    const data = datosGlobales.por_estado;
    if (!data || data.length === 0) return;
    
    const labels = data.map(item => item['Estado (término)']);
    const totales = data.map(item => item.Total);
    
    charts.estado = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: totales,
                backgroundColor: [
                    colores.verde_vibrante,
                    colores.naranja_vibrante,
                    colores.rojo_vibrante
                ],
                borderColor: colores.azul_vibrante,
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

function createChartResultado() {
    const ctx = document.getElementById('chartResultado');
    if (!ctx) return;
    
    const data = datosGlobales.por_resultado;
    if (!data || data.length === 0) return;
    
    const labels = data.map(item => item.Resultado);
    const totales = data.map(item => item.Total);
    
    charts.resultado = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: totales,
                backgroundColor: colores.paleta_vibrante,
                borderColor: colores.azul_vibrante,
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

function createChartTutela() {
    const ctx = document.getElementById('chartTutela');
    if (!ctx) return;
    
    const data = datosGlobales.por_tutela;
    if (!data || data.length === 0) return;
    
    // Calcular total para obtener porcentajes
    const total = data.reduce((sum, item) => sum + item.Total, 0);
    
    const labels = data.map(item => {
        const porcentaje = ((item.Total / total) * 100).toFixed(1);
        return item.Tutela === 'Sí' ? `Con Tutela (${porcentaje}%)` : `Sin Tutela (${porcentaje}%)`;
    });
    const totales = data.map(item => item.Total);
    
    charts.tutela = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: totales,
                backgroundColor: [
                    colores.rojo_vibrante,
                    colores.verde_vibrante
                ],
                borderColor: colores.azul_vibrante,
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ===== TABLA DE DATOS =====
function initDataTable() {
    const datos = datosGlobales.datos;
    
    if (!datos || datos.length === 0) return;
    
    try {
        const table = $('#datosTable').DataTable({
            data: datos,
            columns: [
                { data: 'Radicado' },
                { 
                    data: 'Fecha radicación',
                    render: function(data) {
                        return data ? new Date(data).toLocaleDateString('es-ES') : '-';
                    }
                },
                { data: 'Departamento' },
                { data: 'Ciudad' },
                { data: 'Tipo de solicitud' },
                { data: 'Régimen' },
                { data: 'Resultado' },
                { data: 'Días de respuesta' },
                { data: 'Sexo' }
            ],
            responsive: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            pageLength: 25,
            order: [[1, 'desc']],
            dom: '<"top"lf>rt<"bottom"ip><"clear">'
        });
        
        // Guardar referencia de la tabla
        window.dataTable = table;
        
    } catch (error) {
        console.error('Error inicializando DataTable:', error);
    }
}

// ===== FILTROS =====
function initFilters() {
    const datos = datosGlobales.datos;
    
    if (!datos || datos.length === 0) return;
    
    try {
        // Obtener valores únicos para cada filtro
        const departamentos = [...new Set(datos.map(d => d.Departamento).filter(Boolean))].sort();
        const tipos = [...new Set(datos.map(d => d['Tipo de solicitud']).filter(Boolean))].sort();
        const regimenes = [...new Set(datos.map(d => d['Régimen']).filter(Boolean))].sort();
        const resultados = [...new Set(datos.map(d => d.Resultado).filter(Boolean))].sort();
        const sexos = [...new Set(datos.map(d => d.Sexo).filter(Boolean))].sort();
        
        // Llenar selectores
        fillSelect('filterDepartamento', departamentos);
        fillSelect('filterTipo', tipos);
        fillSelect('filterEstado', regimenes);
        fillSelect('filterResultado', resultados);
        fillSelect('filterTutela', sexos);
        
        // Agregar event listeners
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', applyFilters);
        });
        
    } catch (error) {
        console.error('Error inicializando filtros:', error);
    }
}

function fillSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function applyFilters() {
    try {
        const departamento = document.getElementById('filterDepartamento')?.value || '';
        const tipo = document.getElementById('filterTipo')?.value || '';
        const estado = document.getElementById('filterEstado')?.value || '';
        const resultado = document.getElementById('filterResultado')?.value || '';
        const tutela = document.getElementById('filterTutela')?.value || '';
        
        // Aplicar filtros a la tabla
        if (window.dataTable) {
            // Limpiar filtros anteriores
            $.fn.dataTable.ext.search.pop();
            
            // Aplicar filtros personalizados
            $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
                const rowDepartamento = data[2] || '';
                const rowTipo = data[4] || '';
                const rowRegimen = data[5] || '';
                const rowResultado = data[6] || '';
                const rowSexo = data[8] || '';
                
                return (!departamento || rowDepartamento === departamento) &&
                       (!tipo || rowTipo === tipo) &&
                       (!estado || rowRegimen === estado) &&
                       (!resultado || rowResultado === resultado) &&
                       (!tutela || rowSexo === tutela);
            });
            
            window.dataTable.draw();
        }
        
    } catch (error) {
        console.error('Error aplicando filtros:', error);
    }
}

// ===== FORMULARIO DE CONTACTO =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Simular envío
            console.log('📧 Enviando mensaje:', data);
            
            // Mostrar mensaje de éxito
            showSuccess('Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.');
            
            // Limpiar formulario
            form.reset();
            
        } catch (error) {
            console.error('Error enviando formulario:', error);
            showError('Error enviando el mensaje. Por favor intenta de nuevo.');
        }
    });
}

// ===== UTILIDADES =====
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    try {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error mostrando notificación:', error);
        // Fallback simple
        alert(message);
    }
}

// ===== ANIMACIONES CSS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Dashboard JavaScript cargado con colores vibrantes');
