// ============================================
// GESTOR DE EQUIPOS DE OFICINA
// ============================================

// Configuración inicial
const today = new Date().toISOString().split('T')[0];

// Datos por defecto
let officeData = {
    office1: {
        seats: 10,
        equipment: [
            {
                id: 1,
                name: "Custom 3 - Core I y II",
                date: today,
                status: "presente"
            },
            {
                id: 2,
                name: "Monitor LG",
                date: today,
                status: "ausente"
            },
            {
                id: 4,
                name: "Teclado Logitech",
                date: today,
                status: "presente"
            }
        ]
    },
    office2: {
        seats: 8,
        equipment: [
            {
                id: 3,
                name: "Impresora HP",
                date: today,
                status: "presente"
            },
            {
                id: 5,
                name: "Proyector Epson",
                date: today,
                status: "ausente"
            }
        ]
    }
};

let equipmentIdCounter = 6;

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

/**
 * Cargar datos desde localStorage
 */
function loadData() {
    try {
        const saved = localStorage.getItem('officeData');
        if (saved) {
            officeData = JSON.parse(saved);
            console.log('✅ Datos cargados desde localStorage');
        }
        
        const savedCounter = localStorage.getItem('equipmentIdCounter');
        if (savedCounter) {
            equipmentIdCounter = parseInt(savedCounter);
        }
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        showAlert('Error al cargar datos guardados. Se usarán datos por defecto.', 'error');
    }
}

/**
 * Guardar datos en localStorage
 */
function saveData() {
    try {
        localStorage.setItem('officeData', JSON.stringify(officeData));
        localStorage.setItem('equipmentIdCounter', equipmentIdCounter.toString());
        console.log('💾 Datos guardados correctamente');
    } catch (error) {
        console.error('❌ Error al guardar datos:', error);
        showAlert('Error al guardar datos. Los cambios pueden perderse.', 'error');
    }
}

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

/**
 * Mostrar alertas al usuario
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Actualizar fecha actual en la interfaz
 */
function updateCurrentDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = today.toLocaleDateString('es-ES', options);
    document.getElementById('currentDate').textContent = formattedDate;
}

/**
 * Actualizar estadísticas generales
 */
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    let totalSeats = officeData.office1.seats + officeData.office2.seats;
    let occupiedSeats = 0;
    let todayEquipmentCount = 0;

    // Contar equipos presentes hoy
    [...officeData.office1.equipment, ...officeData.office2.equipment].forEach(equipment => {
        if (equipment.date === today) {
            todayEquipmentCount++;
            if (equipment.status === 'presente') {
                occupiedSeats++;
            }
        }
    });

    // Actualizar interfaz
    document.getElementById('totalSeats').textContent = totalSeats;
    document.getElementById('availableSeats').textContent = Math.max(0, totalSeats - occupiedSeats);
    document.getElementById('todayEquipment').textContent = todayEquipmentCount;
}

// ============================================
// FUNCIONES DE GESTIÓN DE OFICINAS
// ============================================

/**
 * Actualizar número de puestos de una oficina
 */
function updateSeats(officeNum) {
    const seatsInput = document.getElementById(`office${officeNum}Seats`);
    const seats = parseInt(seatsInput.value) || 0;
    
    if (seats < 0) {
        showAlert('El número de puestos no puede ser negativo', 'error');
        seatsInput.value = officeData[`office${officeNum}`].seats;
        return;
    }
    
    officeData[`office${officeNum}`].seats = seats;
    saveData();
    updateStats();
    showAlert(`Puestos de Oficina ${officeNum} actualizados: ${seats}`, 'success');
}

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

/**
 * Renderizar equipos programados para hoy
 */
function renderTodayEquipment() {
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('todayEquipmentList');
    const todayEquipments = [];
    
    // Recopilar equipos de hoy de ambas oficinas
    [1, 2].forEach(officeNum => {
        officeData[`office${officeNum}`].equipment.forEach(item => {
            if (item.date === today) {
                todayEquipments.push({
                    ...item,
                    office: officeNum
                });
            }
        });
    });
    
    // Actualizar contador
    document.getElementById('todayEquipmentDetail').textContent = todayEquipments.length;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Mostrar mensaje si no hay equipos
    if (todayEquipments.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No hay equipos programados para hoy</div>';
        return;
    }
    
    // Renderizar equipos
    todayEquipments.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card today-equipment';
        
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${escapeHtml(item.name)}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">
                    Oficina ${item.office}
                </span>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            <div style="margin-top: 10px; color: #27ae60; font-weight: bold;">
                📅 Programado para hoy
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Renderizar equipos de una oficina específica
 */
function renderOfficeEquipment(officeNum) {
    const today = new Date().toISOString().split('T')[0];
    const equipment = officeData[`office${officeNum}`].equipment;
    const container = document.getElementById(`office${officeNum}Equipment`);
    
    container.innerHTML = '';
    
    // Mostrar mensaje si no hay equipos
    if (equipment.length === 0) {
        container.innerHTML = '<div class="empty-state">📦 No hay equipos registrados</div>';
        return;
    }
    
    // Renderizar cada equipo
    equipment.forEach(item => {
        const isToday = item.date === today;
        const card = document.createElement('div');
        card.className = `equipment-card ${isToday ? 'today-equipment' : ''}`;
        
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${escapeHtml(item.name)}</div>
                <button class="delete-btn" onclick="deleteEquipment(${officeNum}, ${item.id})" title="Eliminar equipo">
                    🗑️
                </button>
            </div>
            <div class="form-group">
                <label>Fecha:</label>
                <input type="date" value="${item.date}" onchange="updateEquipmentDate(${officeNum}, ${item.id}, this.value)">
            </div>
            <div class="form-group">
                <label>Estado:</label>
                <select onchange="updateEquipmentStatus(${officeNum}, ${item.id}, this.value)">
                    <option value="presente" ${item.status === 'presente' ? 'selected' : ''}>Presente</option>
                    <option value="ausente" ${item.status === 'ausente' ? 'selected' : ''}>Ausente</option>
                </select>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${isToday ? '<div style="margin-top: 10px; color: #27ae60; font-weight: bold;">📅 Hoy</div>' : ''}
        `;
        
        container.appendChild(card);
    });
}

// ============================================
// FUNCIONES DE GESTIÓN DE EQUIPOS
// ============================================

/**
 * Agregar nuevo equipo
 */
function addEquipment(officeNum) {
    const nameInput = document.getElementById(`office${officeNum}Name`);
    const dateInput = document.getElementById(`office${officeNum}Date`);
    const statusSelect = document.getElementById(`office${officeNum}Status`);
    
    const name = nameInput.value.trim();
    const date = dateInput.value;
    const status = statusSelect.value;
    
    // Validaciones
    if (!name) {
        showAlert('Por favor, ingresa el nombre del equipo.', 'error');
        nameInput.focus();
        return;
    }
    
    if (!date) {
        showAlert('Por favor, selecciona una fecha.', 'error');
        dateInput.focus();
        return;
    }
    
    // Verificar si ya existe un equipo con el mismo nombre
    const existingEquipment = officeData[`office${officeNum}`].equipment.find(
        item => item.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingEquipment) {
        showAlert(`Ya existe un equipo con el nombre "${name}" en la Oficina ${officeNum}.`, 'error');
        nameInput.focus();
        return;
    }
    
    // Crear nuevo equipo
    const newEquipment = {
        id: equipmentIdCounter++,
        name: name,
        date: date,
        status: status
    };
    
    // Agregar al array
    officeData[`office${officeNum}`].equipment.push(newEquipment);
    
    // Limpiar formulario
    nameInput.value = '';
    dateInput.value = today;
    statusSelect.value = 'presente';
    
    // Actualizar interfaz
    saveData();
    renderOfficeEquipment(officeNum);
    renderTodayEquipment();
    updateStats();
    
    showAlert(`✅ Equipo "${name}" agregado exitosamente a la Oficina ${officeNum}`, 'success');
}

/**
 * Eliminar equipo
 */
function deleteEquipment(officeNum, equipmentId) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    
    if (!equipment) {
        showAlert('Equipo no encontrado.', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${equipment.name}"?\n\nEsta acción no se puede deshacer.`)) {
        // Eliminar del array
        officeData[`office${officeNum}`].equipment = 
            officeData[`office${officeNum}`].equipment.filter(item => item.id !== equipmentId);
        
        // Actualizar interfaz
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        
        showAlert(`🗑️ Equipo "${equipment.name}" eliminado exitosamente`, 'success');
    }
}

/**
 * Actualizar fecha de un equipo
 */
function updateEquipmentDate(officeNum, equipmentId, newDate) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    
    if (!equipment) {
        showAlert('Equipo no encontrado.', 'error');
        return;
    }
    
    if (!newDate) {
        showAlert('Por favor, selecciona una fecha válida.', 'error');
        return;
    }
    
    equipment.date = newDate;
    saveData();
    renderOfficeEquipment(officeNum);
    renderTodayEquipment();
    updateStats();
    
    showAlert(`📅 Fecha del equipo "${equipment.name}" actualizada`, 'success');
}

/**
 * Actualizar estado de un equipo
 */
function updateEquipmentStatus(officeNum, equipmentId, newStatus) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    
    if (!equipment) {
        showAlert('Equipo no encontrado.', 'error');
        return;
    }
    
    if (!['presente', 'ausente'].includes(newStatus)) {
        showAlert('Estado no válido.', 'error');
        return;
    }
    
    equipment.status = newStatus;
    saveData();
    renderOfficeEquipment(officeNum);
    renderTodayEquipment();
    updateStats();
    
    const statusText = newStatus === 'presente' ? 'Presente' : 'Ausente';
    showAlert(`📊 Estado del equipo "${equipment.name}" actualizado a: ${statusText}`, 'success');
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Validar estructura de datos
 */
function validateData() {
    if (!officeData || typeof officeData !== 'object') {
        throw new Error('Datos de oficina no válidos');