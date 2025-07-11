// Datos en memoria (en un entorno real, usar localStorage)
// Obtenemos la fecha actual para los ejemplos
const today = new Date().toISOString().split('T')[0];

let officeData = {
    office1: {
        seats: 10,
        equipment: [
            {
                id: 1,
                name: "Custom 3 - Core I y II",
                date: today, // Fecha actual
                status: "presente"
            },
            {
                id: 2,
                name: "Monitor LG",
                date: today, // Fecha pasada
                status: "ausente"
            },
            {
                id: 4,
                name: "Teclado Logitech",
                date: today, // Fecha actual
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
                date: today, // Fecha actual
                status: "presente"
            },
            {
                id: 5,
                name: "Proyector Epson",
                date: today, // Fecha actual
                status: "ausente"
            }
        ]
    }
};

let equipmentIdCounter = 6;

// Función para cargar datos (simula localStorage)
function loadData() {
    // En un entorno real, descomentar estas líneas:
    // const saved = localStorage.getItem('officeData');
    // if (saved) {
    //     officeData = JSON.parse(saved);
    // }
    // const savedCounter = localStorage.getItem('equipmentIdCounter');
    // if (savedCounter) {
    //     equipmentIdCounter = parseInt(savedCounter);
    // }
}

// Función para guardar datos (simula localStorage)
function saveData() {
    // En un entorno real, descomentar estas líneas:
    // localStorage.setItem('officeData', JSON.stringify(officeData));
    // localStorage.setItem('equipmentIdCounter', equipmentIdCounter.toString());
}

// Mostrar fecha actual
function updateCurrentDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = 
        today.toLocaleDateString('es-ES', options);
}

// Actualizar estadísticas
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

    document.getElementById('totalSeats').textContent = totalSeats;
    document.getElementById('availableSeats').textContent = totalSeats - occupiedSeats;
    document.getElementById('todayEquipment').textContent = todayEquipmentCount;
}

// Actualizar puestos de oficina
function updateSeats(officeNum) {
    const seats = parseInt(document.getElementById(`office${officeNum}Seats`).value) || 0;
    officeData[`office${officeNum}`].seats = seats;
    saveData();
    updateStats();
}

// Renderizar equipos del día actual
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
    
    document.getElementById('todayEquipmentDetail').textContent = todayEquipments.length;
    
    container.innerHTML = '';
    
    if (todayEquipments.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hay equipos programados para hoy</div>';
        return;
    }
    
    todayEquipments.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card today-equipment';
        
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
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

// Renderizar equipos de una oficina
function renderOfficeEquipment(officeNum) {
    const today = new Date().toISOString().split('T')[0];
    const equipment = officeData[`office${officeNum}`].equipment;
    const container = document.getElementById(`office${officeNum}Equipment`);
    
    container.innerHTML = '';
    
    equipment.forEach(item => {
        const isToday = item.date === today;
        const card = document.createElement('div');
        card.className = `equipment-card ${isToday ? 'today-equipment' : ''}`;
        
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <button class="delete-btn" onclick="deleteEquipment(${officeNum}, ${item.id})">
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

// Agregar nuevo equipo
function addEquipment(officeNum) {
    const name = document.getElementById(`office${officeNum}Name`).value.trim();
    const date = document.getElementById(`office${officeNum}Date`).value;
    const status = document.getElementById(`office${officeNum}Status`).value;
    
    if (!name || !date) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    const newEquipment = {
        id: equipmentIdCounter++,
        name: name,
        date: date,
        status: status
    };
    
    officeData[`office${officeNum}`].equipment.push(newEquipment);
    
    // Limpiar formulario
    document.getElementById(`office${officeNum}Name`).value = '';
    document.getElementById(`office${officeNum}Date`).value = '';
    document.getElementById(`office${officeNum}Status`).value = 'presente';
    
    saveData();
    renderOfficeEquipment(officeNum);
    renderTodayEquipment();
    updateStats();
}

// Eliminar equipo
function deleteEquipment(officeNum, equipmentId) {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
        officeData[`office${officeNum}`].equipment = 
            officeData[`office${officeNum}`].equipment.filter(item => item.id !== equipmentId);
        
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
    }
}

// Actualizar fecha de equipo
function updateEquipmentDate(officeNum, equipmentId, newDate) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.date = newDate;
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
    }
}

// Actualizar estado de equipo
function updateEquipmentStatus(officeNum, equipmentId, newStatus) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.status = newStatus;
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
    }
}

// Inicializar aplicación
function init() {
    loadData();
    updateCurrentDate();
    
    // Establecer valores iniciales
    document.getElementById('office1Seats').value = officeData.office1.seats;
    document.getElementById('office2Seats').value = officeData.office2.seats;
    
    // Establecer fecha actual en los formularios
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('office1Date').value = today;
    document.getElementById('office2Date').value = today;
    
    renderOfficeEquipment(1);
    renderOfficeEquipment(2);
    renderTodayEquipment();
    updateStats();
}

// Inicializar cuando la página carga
window.onload = init;