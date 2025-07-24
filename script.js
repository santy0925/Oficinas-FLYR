// Obtiene la fecha actual y la formatea a una cadena ISO (ej. "AAAA-MM-DD")
const today = new Date();
const todayISO = today.toISOString().split('T')[0];

// Inicializa los datos de las oficinas con valores predeterminados para dos oficinas.
// 'seats' se refiere a los asientos rotativos, 'fixedSeats' son asientos asignados permanentemente,
// y 'equipment' es un array para almacenar visitas de equipos/grupos programadas.
let officeData = {
    office1: {
        seats: 10, // Asientos rotativos para la Oficina 1
        fixedSeats: 2, // Asientos fijos para la Oficina 1
        equipment: [] // Lista de equipos/grupos programados para la Oficina 1
    },
    office2: {
        seats: 8, // Asientos rotativos para la Oficina 2
        fixedSeats: 2, // Asientos fijos para la Oficina 2
        equipment: [] // Lista de equipos/grupos programados para la Oficina 2
    }
};

// Contador para los IDs únicos de equipos
let equipmentIdCounter = 1;

/**
 * Carga los datos guardados de las oficinas y el contador de IDs de equipos desde el almacenamiento local.
 * Esto asegura la persistencia de los datos entre sesiones del navegador.
 */
function loadData() {
    const saved = localStorage.getItem('officeData');
    if (saved) {
        officeData = JSON.parse(saved); // Parsea la cadena JSON de vuelta a un objeto
    }
    const savedCounter = localStorage.getItem('equipmentIdCounter');
    if (savedCounter) {
        equipmentIdCounter = parseInt(savedCounter); // Parsea la cadena de vuelta a un entero
    }
}

/**
 * Guarda los datos actuales de las oficinas y el contador de IDs de equipos en el almacenamiento local.
 * Los datos se convierten a una cadena JSON para su almacenamiento.
 */
function saveData() {
    localStorage.setItem('officeData', JSON.stringify(officeData));
    localStorage.setItem('equipmentIdCounter', equipmentIdCounter.toString());
}

/**
 * Actualiza la fecha actual mostrada en la página web.
 * La fecha se formatea para el idioma español.
 */
function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent =
        today.toLocaleDateString('es-ES', options);
}

/**
 * Actualiza varias estadísticas mostradas en el panel de control, como:
 * - Total de asientos (rotativos + fijos)
 * - Asientos fijos
 * - Asientos rotativos
 * - Asientos rotativos disponibles para hoy
 * - Número de equipos/grupos programados para hoy
 */
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const office1 = officeData.office1;
    const office2 = officeData.office2;

    const rotativeSeats1 = office1.seats;
    const rotativeSeats2 = office2.seats;
    const fixedSeats1 = office1.fixedSeats || 0; // Por defecto 0 si no está definido
    const fixedSeats2 = office2.fixedSeats || 0;

    const rotativeSeats = rotativeSeats1 + rotativeSeats2;
    const fixedSeats = fixedSeats1 + fixedSeats2;
    const totalSeats = rotativeSeats + fixedSeats;

    let occupiedRotativeSeats = 0;
    let todayEquipmentCount = 0;

    // Itera a través de todos los equipos de ambas oficinas
    [...office1.equipment, ...office2.equipment].forEach(equipment => {
        // Comprueba si el equipo está programado para hoy y su estado es "presente"
        if (equipment.date === today && equipment.status === 'presente') {
            occupiedRotativeSeats += equipment.people || 0; // Suma el número de personas
            todayEquipmentCount++;
        }
    });

    // Actualiza los elementos HTML con las estadísticas calculadas
    document.getElementById('totalSeats').textContent = totalSeats;
    document.getElementById('fixedSeats').textContent = fixedSeats;
    document.getElementById('rotativeSeats').textContent = rotativeSeats;
    // Asegura que los asientos disponibles no sean negativos
    document.getElementById('availableSeats').textContent = Math.max(rotativeSeats - occupiedRotativeSeats, 0);
    document.getElementById('todayEquipment').textContent = todayEquipmentCount;

    // Actualiza el recuento de asientos individuales de cada oficina
    document.getElementById('fixedSeats1').textContent = fixedSeats1;
    document.getElementById('fixedSeats2').textContent = fixedSeats2;
    document.getElementById('rotativeSeats1').textContent = rotativeSeats1;
    document.getElementById('rotativeSeats2').textContent = rotativeSeats2;
}

/**
 * Actualiza el número de asientos rotativos para una oficina específica.
 * @param {number} officeNum - El número de la oficina (1 o 2).
 */
function updateSeats(officeNum) {
    const seats = parseInt(document.getElementById(`office${officeNum}Seats`).value) || 0;
    officeData[`office${officeNum}`].seats = seats;
    saveData(); // Guarda los cambios en el almacenamiento local
    updateStats(); // Recalcula y actualiza las estadísticas
}

/**
 * Actualiza el número de asientos fijos para una oficina específica.
 * @param {number} officeNum - El número de la oficina (1 o 2).
 */
function updateFixedSeats(officeNum) {
    const fixedSeats = parseInt(document.getElementById(`office${officeNum}FixedSeats`).value) || 0;
    officeData[`office${officeNum}`].fixedSeats = fixedSeats;
    saveData();
    updateStats();
}

/**
 * Obtiene el día de la semana para una cadena de fecha dada.
 * @param {string} dateString - La fecha en formato 'AAAA-MM-DD'.
 * @returns {string} El día de la semana en español.
 */
function getDayOfWeek(dateString) {
    // Añade 'T00:00:00' para asegurar que la fecha se analiza en hora local, evitando problemas de zona horaria
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long' };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Renderiza la lista de equipos/grupos programados para hoy.
 * Muestra su nombre, oficina, estado, número de personas y fecha.
 */
function renderTodayEquipment() {
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('todayEquipmentList');
    const todayEquipments = [];
    let totalTodayPeople = 0;

    // Recopila los equipos programados para hoy de ambas oficinas
    [1, 2].forEach(officeNum => {
        officeData[`office${officeNum}`].equipment.forEach(item => {
            if (item.date === today) {
                todayEquipments.push({ ...item, office: officeNum }); // Añade el número de oficina al elemento
                totalTodayPeople += item.people || 0;
            }
        });
    });

    document.getElementById('todayEquipmentDetail').textContent = todayEquipments.length;
    document.getElementById('todayPeople').textContent = totalTodayPeople;
    container.innerHTML = ''; // Limpia el contenido anterior

    // Muestra un mensaje si no hay equipos programados para hoy
    if (todayEquipments.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hay equipos programados para hoy</div>';
        return;
    }

    // Renderiza una tarjeta para cada equipo programado para hoy
    todayEquipments.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card today-equipment';
        const dayOfWeek = getDayOfWeek(item.date);
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #27ae60; font-weight: bold;">📅 ${item.date} (${dayOfWeek})</div>
        `;
        container.appendChild(card);
    });
}

/**
 * Renderiza los equipos/grupos programados para días pasados y futuros (hasta 10 días en cada dirección).
 */
function renderAdjacentDayEquipment() {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const yesterdayContainer = document.getElementById('yesterdayEquipmentList');
    const yesterdayCount = document.getElementById('yesterdayCount');
    const yesterdayPeople = document.getElementById('yesterdayPeople');

    yesterdayContainer.innerHTML = ''; // Limpia el contenido anterior

    const previousEquipments = [];
    let totalPreviousPeople = 0;
    const formatDate = date => date.toISOString().split('T')[0];

    // Recopila equipos de los últimos 10 días
    for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i); // Resta 'i' días a la fecha actual
        const dateStr = formatDate(date);
        [1, 2].forEach(officeNum => {
            officeData[`office${officeNum}`].equipment.forEach(item => {
                if (item.date === dateStr) {
                    // Añade una etiqueta para indicar cuántos días atrás fue
                    previousEquipments.push({ ...item, office: officeNum, label: `Hace ${i} día${i > 1 ? 's' : ''}` });
                    totalPreviousPeople += item.people || 0;
                }
            });
        });
    }

    /**
     * Función auxiliar para crear una tarjeta de equipo para días pasados/futuros.
     * @param {object} item - El elemento del equipo.
     * @returns {HTMLElement} El elemento de la tarjeta creado.
     */
    const renderCard = (item) => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        const dayOfWeek = getDayOfWeek(item.date);
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-absent">
                ❌ Ausente
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #e67e22; font-weight: bold;">📅 ${item.date} (${dayOfWeek}) - ${item.label}</div>
        `;
        return card;
    };

    yesterdayCount.textContent = previousEquipments.length;
    yesterdayPeople.textContent = totalPreviousPeople;

    // Muestra un mensaje o renderiza las tarjetas para los días anteriores
    if (previousEquipments.length === 0) {
        yesterdayContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hubo equipos en los últimos días</div>';
    } else {
        previousEquipments.forEach(item => {
            yesterdayContainer.appendChild(renderCard(item));
        });
    }

    // --- Renderizar Días Siguientes ---
    const nextDaysContainer = document.getElementById('tomorrowEquipmentList');
    const nextDaysCount = document.getElementById('tomorrowCount');
    const nextDaysPeople = document.getElementById('tomorrowPeople');

    nextDaysContainer.innerHTML = ''; // Limpia el contenido anterior
    const nextDaysEquipments = [];
    let totalNextDaysPeople = 0;

    // Recopila equipos de los próximos 10 días
    for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i); // Suma 'i' días a la fecha actual
        const dateStr = formatDate(date);

        [1, 2].forEach(officeNum => {
            officeData[`office${officeNum}`].equipment.forEach(item => {
                if (item.date === dateStr) {
                    const dayLabel = i === 1 ? 'Mañana' : `En ${i} días`;
                    nextDaysEquipments.push({ ...item, office: officeNum, label: dayLabel, daysFromToday: i });
                    totalNextDaysPeople += item.people || 0;
                }
            });
        });
    }

    /**
     * Función auxiliar para crear una tarjeta de equipo para los próximos días.
     * @param {object} item - El elemento del equipo.
     * @returns {HTMLElement} El elemento de la tarjeta creado.
     */
    const renderNextDaysCard = (item) => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        const dayOfWeek = getDayOfWeek(item.date);
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-absent">
                ❌ Ausente
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #3498db; font-weight: bold;">📅 ${item.date} (${dayOfWeek}) - ${item.label}</div>
        `;
        return card;
    };

    nextDaysCount.textContent = nextDaysEquipments.length;
    nextDaysPeople.textContent = totalNextDaysPeople;

    // Muestra un mensaje o renderiza las tarjetas para los próximos días
    if (nextDaysEquipments.length === 0) {
        nextDaysContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hay equipos programados para los próximos días</div>';
    } else {
        // Ordena los equipos próximos por su proximidad a hoy
        nextDaysEquipments.sort((a, b) => a.daysFromToday - b.daysFromToday);
        nextDaysEquipments.forEach(item => {
            nextDaysContainer.appendChild(renderNextDaysCard(item));
        });
    }
}

/**
 * Renderiza la lista de equipos para una oficina específica.
 * Permite editar la fecha, el estado y el número de personas, y eliminar equipos.
 * @param {number} officeNum - El número de la oficina (1 o 2).
 */
function renderOfficeEquipment(officeNum) {
    const today = new Date().toISOString().split('T')[0];
    const equipment = officeData[`office${officeNum}`].equipment;
    const container = document.getElementById(`office${officeNum}Equipment`);
    container.innerHTML = ''; // Limpia el contenido anterior

    equipment.forEach(item => {
        const isToday = item.date === today;
        const card = document.createElement('div');
        // Añade una clase 'today-equipment' si el equipo está programado para hoy
        card.className = `equipment-card ${isToday ? 'today-equipment' : ''}`;
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <button class="delete-btn" onclick="deleteEquipment(${officeNum}, ${item.id})">🗑️</button>
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
            <div class="form-group">
                <label>Personas:</label>
                <input type="number" min="0" value="${item.people || ''}" onchange="updateEquipmentPeople(${officeNum}, ${item.id}, this.value)">
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${isToday ? '<div style="margin-top: 10px; color: #27ae60; font-weight: bold;">📅 Hoy</div>' : ''}
        `;
        container.appendChild(card);
    });
}

/**
 * Añade un nuevo equipo/grupo a una oficina especificada.
 * Valida los campos de entrada antes de añadir.
 * @param {number} officeNum - El número de la oficina (1 o 2).
 */
function addEquipment(officeNum) {
    const name = document.getElementById(`office${officeNum}Name`).value.trim();
    const date = document.getElementById(`office${officeNum}Date`).value;
    const status = document.getElementById(`office${officeNum}Status`).value;
    const people = parseInt(document.getElementById(`office${officeNum}People`).value) || 0;

    // Validación de entrada
    if (!name || !date) {
        alert('Por favor, completa los campos de Nombre y Fecha.');
        return;
    }

    // Crea un nuevo objeto de equipo
    const newEquipment = {
        id: equipmentIdCounter++, // Asigna un ID único e incrementa el contador
        name,
        date,
        status,
        people
    };
    officeData[`office${officeNum}`].equipment.push(newEquipment);

    // Limpia los campos de entrada después de añadir
    document.getElementById(`office${officeNum}Name`).value = '';
    document.getElementById(`office${officeNum}Date`).value = '';
    document.getElementById(`office${officeNum}Status`).value = 'presente';
    document.getElementById(`office${officeNum}People`).value = '';

    saveData(); // Guarda los cambios
    renderOfficeEquipment(officeNum); // Vuelve a renderizar la lista de equipos de la oficina
    renderTodayEquipment(); // Actualiza la lista de equipos de hoy
    updateStats(); // Actualiza las estadísticas del panel de control
    renderAdjacentDayEquipment(); // Actualiza la lista de equipos de días adyacentes
}

/**
 * Elimina un equipo/grupo de una oficina específica basándose en su ID.
 * Incluye una solicitud de confirmación.
 * @param {number} officeNum - El número de la oficina (1 o 2).
 * @param {number} equipmentId - El ID del equipo a eliminar.
 */
function deleteEquipment(officeNum, equipmentId) {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
        // Filtra el equipo a eliminar
        officeData[`office${officeNum}`].equipment = officeData[`office${officeNum}`].equipment.filter(item => item.id !== equipmentId);
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

/**
 * Actualiza la fecha de un elemento de equipo específico.
 * @param {number} officeNum - El número de la oficina.
 * @param {number} equipmentId - El ID del equipo.
 * @param {string} newDate - La nueva fecha.
 */
function updateEquipmentDate(officeNum, equipmentId, newDate) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.date = newDate;
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

/**
 * Actualiza el estado (presente/ausente) de un elemento de equipo específico.
 * @param {number} officeNum - El número de la oficina.
 * @param {number} equipmentId - El ID del equipo.
 * @param {string} newStatus - El nuevo estado.
 */
function updateEquipmentStatus(officeNum, equipmentId, newStatus) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.status = newStatus;
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

/**
 * Actualiza el número de personas asociadas con un elemento de equipo específico.
 * @param {number} officeNum - El número de la oficina.
 * @param {number} equipmentId - El ID del equipo.
 * @param {string} newPeople - El nuevo número de personas (se analizará como entero).
 */
function updateEquipmentPeople(officeNum, equipmentId, newPeople) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.people = parseInt(newPeople) || 0; // Parsea a entero, por defecto 0 si es inválido
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

/**
 * Inicializa la aplicación:
 * - Carga los datos del almacenamiento local.
 * - Actualiza la visualización de la fecha actual.
 * - Establece los valores iniciales para las entradas de asientos de las oficinas.
 * - Establece la fecha predeterminada para el nuevo equipo a la fecha actual.
 * - Renderiza todas las listas de equipos y actualiza las estadísticas.
 */
function init() {
    loadData(); // Carga datos al iniciar
    updateCurrentDate(); // Actualiza la fecha mostrada

    // Establece los valores iniciales para los campos de entrada de asientos desde los datos cargados
    document.getElementById('office1Seats').value = officeData.office1.seats;
    document.getElementById('office2Seats').value = officeData.office2.seats;
    document.getElementById('office1FixedSeats').value = officeData.office1.fixedSeats || 0;
    document.getElementById('office2FixedSeats').value = officeData.office2.fixedSeats || 0;

    // Establece la fecha predeterminada para las nuevas entradas de equipo a la fecha de hoy
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = (todayLocal.getMonth() + 1).toString().padStart(2, '0'); // El mes es de 0 a 11, por eso +1
    const day = todayLocal.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;

    document.getElementById('office1Date').value = formattedToday;
    document.getElementById('office2Date').value = formattedToday;

    // Renderización inicial de todos los componentes
    renderOfficeEquipment(1);
    renderOfficeEquipment(2);
    renderTodayEquipment();
    renderAdjacentDayEquipment();
    updateStats();
}

// --- Gestión de Equipos de la Empresa ---

// Carga los equipos de la empresa del almacenamiento local, o inicializa como un array vacío si no se encuentran
let companyTeams = JSON.parse(localStorage.getItem("companyTeams")) || [];

/**
 * Guarda el array actual de equipos de la empresa en el almacenamiento local.
 */
function saveCompanyTeams() {
    localStorage.setItem("companyTeams", JSON.stringify(companyTeams));
}

/**
 * Renderiza la lista de equipos de la empresa. Cada equipo puede ser editado o eliminado.
 */
function renderCompanyTeams() {
    const container = document.getElementById("companyTeamsList");
    container.innerHTML = ""; // Limpia el contenido anterior

    companyTeams.forEach((team, index) => {
        const div = document.createElement("div");
        div.className = "company-team";

        // Campo de entrada para el nombre del equipo
        const nameInput = document.createElement("input");
        nameInput.value = team.name;
        nameInput.oninput = () => {
            companyTeams[index].name = nameInput.value;
            saveCompanyTeams(); // Guarda los cambios al escribir
        };

        // Campo de entrada para los días del equipo (ej. "Lun, Mié")
        const daysInput = document.createElement("input");
        daysInput.value = team.days;
        daysInput.oninput = () => {
            companyTeams[index].days = daysInput.value;
            saveCompanyTeams();
        };

        // Campo de entrada para el número de personas en el equipo
        const peopleInput = document.createElement("input");
        peopleInput.type = "number";
        peopleInput.min = "1";
        peopleInput.value = team.people;
        peopleInput.oninput = () => {
            companyTeams[index].people = parseInt(peopleInput.value);
            saveCompanyTeams();
        };

        // Botón de eliminación para el equipo
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.onclick = () => {
            const confirmDelete = confirm("🗑️ ¿Deseas eliminar este equipo?\n\nEsta acción no se puede deshacer.");
            if (confirmDelete) {
                companyTeams.splice(index, 1); // Elimina el equipo del array
                saveCompanyTeams();
                renderCompanyTeams(); // Vuelve a renderizar la lista
            }
        };

        // Añade todos los elementos al div del equipo
        div.append("Equipo:", nameInput, " Días:", daysInput, " Personas:", peopleInput, deleteBtn);
        container.appendChild(div);
    });
}

/**
 * Añade un nuevo equipo de empresa a la lista.
 * Valida los campos de entrada antes de añadir.
 */
function addCompanyTeam() {
    const name = document.getElementById("companyName").value.trim();
    const days = document.getElementById("companyDays").value.trim();
    const people = parseInt(document.getElementById("companyPeople").value);

    // Validación de entrada
    if (name && days && people > 0) {
        companyTeams.push({ name, days, people }); // Añade el nuevo objeto de equipo
        saveCompanyTeams();
        renderCompanyTeams(); // Vuelve a renderizar la lista

        // Limpia los campos de entrada
        document.getElementById("companyName").value = "";
        document.getElementById("companyDays").value = "";
        document.getElementById("companyPeople").value = "1";
    }
}

// Escuchador de eventos para renderizar los equipos de la empresa cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", renderCompanyTeams);

// Escuchador de eventos para inicializar la gestión principal de oficinas/equipos cuando la ventana se carga
window.onload = init;