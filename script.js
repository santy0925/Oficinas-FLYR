const today = new Date().toISOString().split('T')[0];

let officeData = {
    office1: {
        seats: 10,
        fixedSeats: 2,
        equipment: []
    },
    office2: {
        seats: 8,
        fixedSeats: 2,
        equipment: []
    }
};

let equipmentIdCounter = 1;

function loadData() {
    const saved = localStorage.getItem('officeData');
    if (saved) {
        officeData = JSON.parse(saved);
    }
    const savedCounter = localStorage.getItem('equipmentIdCounter');
    if (savedCounter) {
        equipmentIdCounter = parseInt(savedCounter);
    }
}

function saveData() {
    localStorage.setItem('officeData', JSON.stringify(officeData));
    localStorage.setItem('equipmentIdCounter', equipmentIdCounter.toString());
}

function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent =
        today.toLocaleDateString('es-ES', options);
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const office1 = officeData.office1;
    const office2 = officeData.office2;

    const rotativeSeats1 = office1.seats;
    const rotativeSeats2 = office2.seats;
    const fixedSeats1 = office1.fixedSeats || 0;
    const fixedSeats2 = office2.fixedSeats || 0;

    const rotativeSeats = rotativeSeats1 + rotativeSeats2;
    const fixedSeats = fixedSeats1 + fixedSeats2;
    const totalSeats = rotativeSeats + fixedSeats;

    let occupiedRotativeSeats = 0;
    let todayEquipmentCount = 0;

    [...office1.equipment, ...office2.equipment].forEach(equipment => {
        if (equipment.date === today && equipment.status === 'presente') {
            occupiedRotativeSeats += equipment.people || 0;
            todayEquipmentCount++;
        }
    });

    document.getElementById('totalSeats').textContent = totalSeats;
    document.getElementById('fixedSeats').textContent = fixedSeats;
    document.getElementById('rotativeSeats').textContent = rotativeSeats;
    document.getElementById('availableSeats').textContent = Math.max(rotativeSeats - occupiedRotativeSeats, 0);
    document.getElementById('todayEquipment').textContent = todayEquipmentCount;

    document.getElementById('fixedSeats1').textContent = fixedSeats1;
    document.getElementById('fixedSeats2').textContent = fixedSeats2;
    document.getElementById('rotativeSeats1').textContent = rotativeSeats1;
    document.getElementById('rotativeSeats2').textContent = rotativeSeats2;
}

function updateSeats(officeNum) {
    const seats = parseInt(document.getElementById(`office${officeNum}Seats`).value) || 0;
    officeData[`office${officeNum}`].seats = seats;
    saveData();
    updateStats();
}

function updateFixedSeats(officeNum) {
    const fixedSeats = parseInt(document.getElementById(`office${officeNum}FixedSeats`).value) || 0;
    officeData[`office${officeNum}`].fixedSeats = fixedSeats;
    saveData();
    updateStats();
}

function renderTodayEquipment() {
    const today = new Date().toISOString().split('T')[0];
    const container = document.getElementById('todayEquipmentList');
    const todayEquipments = [];

    [1, 2].forEach(officeNum => {
        officeData[`office${officeNum}`].equipment.forEach(item => {
            if (item.date === today) {
                todayEquipments.push({ ...item, office: officeNum });
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
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #27ae60; font-weight: bold;">📅 Programado para hoy</div>
        `;
        container.appendChild(card);
    });
}

function renderAdjacentDayEquipment() {
    const today = new Date();
    const yesterdayContainer = document.getElementById('yesterdayEquipmentList');
    const yesterdayCount = document.getElementById('yesterdayCount');
    const yesterdayPeople = document.getElementById('yesterdayPeople');

    yesterdayContainer.innerHTML = '';

    const previousEquipments = [];
    let totalPreviousPeople = 0;

    const formatDate = date => date.toISOString().split('T')[0];

    // Últimos 10 días anteriores a hoy
    for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDate(date);

        [1, 2].forEach(officeNum => {
            officeData[`office${officeNum}`].equipment.forEach(item => {
                if (item.date === dateStr) {
                    previousEquipments.push({ ...item, office: officeNum, label: `Hace ${i} día${i > 1 ? 's' : ''}` });
                    totalPreviousPeople += item.people || 0;
                }
            });
        });
    }

    const renderCard = (item) => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #e67e22; font-weight: bold;">📅 ${item.label}</div>
        `;
        return card;
    };

    yesterdayCount.textContent = previousEquipments.length;
    yesterdayPeople.textContent = totalPreviousPeople;

    if (previousEquipments.length === 0) {
        yesterdayContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hubo equipos en los últimos días</div>';
    } else {
        previousEquipments.forEach(item => {
            yesterdayContainer.appendChild(renderCard(item));
        });
    }

    // "Mañana"
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    const tomorrowContainer = document.getElementById('tomorrowEquipmentList');
    const tomorrowCount = document.getElementById('tomorrowCount');
    const tomorrowPeople = document.getElementById('tomorrowPeople');

    tomorrowContainer.innerHTML = '';
    const tomorrowEquipments = [];
    let totalTomorrowPeople = 0;

    [1, 2].forEach(officeNum => {
        officeData[`office${officeNum}`].equipment.forEach(item => {
            if (item.date === tomorrowStr) {
                tomorrowEquipments.push({ ...item, office: officeNum });
                totalTomorrowPeople += item.people || 0;
            }
        });
    });

    const renderTomorrowCard = (item) => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <div class="equipment-header">
                <div class="equipment-name">${item.name}</div>
                <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 10px; font-size: 0.9em;">Oficina ${item.office}</span>
            </div>
            <div class="status-badge status-${item.status}">
                ${item.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
            </div>
            ${item.people ? `<div style="margin-top: 5px; font-size: 0.9em; color: #555;">👥 Personas: ${item.people}</div>` : ''}
            <div style="margin-top: 10px; color: #e67e22; font-weight: bold;">📅 Mañana</div>
        `;
        return card;
    };

    tomorrowCount.textContent = tomorrowEquipments.length;
    tomorrowPeople.textContent = totalTomorrowPeople;

    if (tomorrowEquipments.length === 0) {
        tomorrowContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hay equipos programados para mañana</div>';
    } else {
        tomorrowEquipments.forEach(item => {
            tomorrowContainer.appendChild(renderTomorrowCard(item));
        });
    }
}

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

function addEquipment(officeNum) {
    const name = document.getElementById(`office${officeNum}Name`).value.trim();
    const date = document.getElementById(`office${officeNum}Date`).value;
    const status = document.getElementById(`office${officeNum}Status`).value;
    const people = parseInt(document.getElementById(`office${officeNum}People`).value) || 0;

    if (!name || !date) {
        alert('Por favor, completa los campos de Nombre y Fecha.');
        return;
    }

    const newEquipment = {
        id: equipmentIdCounter++,
        name,
        date,
        status,
        people
    };

    officeData[`office${officeNum}`].equipment.push(newEquipment);

    document.getElementById(`office${officeNum}Name`).value = '';
    document.getElementById(`office${officeNum}Date`).value = '';
    document.getElementById(`office${officeNum}Status`).value = 'presente';
    document.getElementById(`office${officeNum}People`).value = '';

    saveData();
    renderOfficeEquipment(officeNum);
    renderTodayEquipment();
    updateStats();
    renderAdjacentDayEquipment();
}

function deleteEquipment(officeNum, equipmentId) {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
        officeData[`office${officeNum}`].equipment = officeData[`office${officeNum}`].equipment.filter(item => item.id !== equipmentId);
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

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

function updateEquipmentPeople(officeNum, equipmentId, newPeople) {
    const equipment = officeData[`office${officeNum}`].equipment.find(item => item.id === equipmentId);
    if (equipment) {
        equipment.people = parseInt(newPeople) || 0;
        saveData();
        renderOfficeEquipment(officeNum);
        renderTodayEquipment();
        updateStats();
        renderAdjacentDayEquipment();
    }
}

function init() {
    loadData();
    updateCurrentDate();

    document.getElementById('office1Seats').value = officeData.office1.seats;
    document.getElementById('office2Seats').value = officeData.office2.seats;
    document.getElementById('office1FixedSeats').value = officeData.office1.fixedSeats || 0;
    document.getElementById('office2FixedSeats').value = officeData.office2.fixedSeats || 0;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('office1Date').value = today;
    document.getElementById('office2Date').value = today;

    renderOfficeEquipment(1);
    renderOfficeEquipment(2);
    renderTodayEquipment();
    renderAdjacentDayEquipment();
    updateStats();
}


let companyTeams = JSON.parse(localStorage.getItem("companyTeams")) || [];

function saveCompanyTeams() {
    localStorage.setItem("companyTeams", JSON.stringify(companyTeams));
}

function renderCompanyTeams() {
    const container = document.getElementById("companyTeamsList");
    container.innerHTML = "";

    companyTeams.forEach((team, index) => {
        const div = document.createElement("div");
        div.className = "company-team";

        const nameInput = document.createElement("input");
        nameInput.value = team.name;
        nameInput.oninput = () => {
            companyTeams[index].name = nameInput.value;
            saveCompanyTeams();
        };

        const daysInput = document.createElement("input");
        daysInput.value = team.days;
        daysInput.oninput = () => {
            companyTeams[index].days = daysInput.value;
            saveCompanyTeams();
        };

        const peopleInput = document.createElement("input");
        peopleInput.type = "number";
        peopleInput.min = "1";
        peopleInput.value = team.people;
        peopleInput.oninput = () => {
            companyTeams[index].people = parseInt(peopleInput.value);
            saveCompanyTeams();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.onclick = () => {
            companyTeams.splice(index, 1);
            saveCompanyTeams();
            renderCompanyTeams();
        };

        div.append("Equipo:", nameInput, " Días:", daysInput, " Personas:", peopleInput, deleteBtn);
        container.appendChild(div);
    });
}

function addCompanyTeam() {
    const name = document.getElementById("companyName").value.trim();
    const days = document.getElementById("companyDays").value.trim();
    const people = parseInt(document.getElementById("companyPeople").value);

    if (name && days && people > 0) {
        companyTeams.push({ name, days, people });
        saveCompanyTeams();
        renderCompanyTeams();

        // Limpiar campos
        document.getElementById("companyName").value = "";
        document.getElementById("companyDays").value = "";
        document.getElementById("companyPeople").value = "1";
    }
}

document.addEventListener("DOMContentLoaded", renderCompanyTeams);

window.onload = init;

