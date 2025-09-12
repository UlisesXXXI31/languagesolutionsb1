// teacher.js
// teacher.js (VERSIÓN CORREGIDA)

document.addEventListener('DOMContentLoaded', async () => {
    // --- CONFIGURACIÓN PRINCIPAL ---
    // Define la URL base de tu API desplegada en Vercel
    const API_BASE_URL = 'https://ls-api-b1.vercel.app';
    // ---------------------------------

    // Verificación de sesión (opcional pero recomendado)
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (!token || userRole !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }

    // Referencias a los elementos del DOM
    const form = document.getElementById('form-add-student');
    const studentNameInput = document.getElementById('student-name');
    const studentEmailInput = document.getElementById('student-email');
    const statusMessage = document.getElementById('status-message');
    const studentListContainer = document.getElementById('student-list');
    const studentProgressSection = document.getElementById('student-progress');
    const studentNameTitle = document.getElementById('student-name-title');
    const progressHistoryContainer = document.getElementById('progress-history-container');
    const btnBackToList = document.getElementById('btn-back-to-list');
    const btnLogout = document.getElementById('btn-logout');

    // Lógica para cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        });
    }

    // Función para obtener y mostrar la lista de alumnos
    async function fetchAndDisplayStudents() {
        try {
            studentListContainer.innerHTML = '<p>Cargando lista de alumnos...</p>';
            // CORREGIDO: Usa la variable API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar alumnos');
            }

            const data = await response.json();
            studentListContainer.innerHTML = '';

            if (data.users.length === 0) {
                studentListContainer.innerHTML = '<p>No hay alumnos registrados aún.</p>';
                return;
            }

            data.users.forEach(user => {
                const studentCard = document.createElement('div');
                studentCard.className = 'student-card';
                studentCard.innerHTML = `
                    <h2>${user.name}</h2>
                    <ul>
                        <li><strong>Email:</strong> ${user.email}</li>
                    </ul>
                `;
                studentCard.style.cursor = 'pointer';
                studentCard.addEventListener('click', () => showStudentProgress(user._id, user.name));
                studentListContainer.appendChild(studentCard);
            });

        } catch (error) {
            studentListContainer.innerHTML = `<p style="color:red;">Error al cargar alumnos: ${error.message}. Asegúrate de que el servidor está funcionando.</p>`;
            console.error("Error:", error);
        }
    }

    // Función para mostrar el progreso de un alumno
    async function showStudentProgress(userId, studentName) {
        studentListContainer.style.display = 'none';
        studentProgressSection.style.display = 'block';
        studentNameTitle.textContent = studentName;
        progressHistoryContainer.innerHTML = '<p>Cargando historial de progreso...</p>';
        
       try {
    // --- ¡ESTA ES LA LÍNEA CORREGIDA! ---
    // La URL se cierra con la comilla ` y luego viene la coma y el objeto de opciones
    const response = await fetch(`${API_BASE_URL}/api/progress/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener el historial de progreso.');
            }
            
            const data = await response.json();
            progressHistoryContainer.innerHTML = '';

            if (data.progress.length === 0) {
                progressHistoryContainer.innerHTML = '<p>No hay historial de progreso para este alumno.</p>';
                return;
            }

            const ul = document.createElement('ul');
           
            data.progress.forEach(entry => {
                const li = document.createElement('li');
                // He cambiado 'entry.timestamp' a 'entry.completedAt' para que coincida con tu modelo
           const date = new Date(entry.completedAt).toLocaleString(); 
                
               // 1. Creamos un texto para el estado basándonos en el valor booleano
           const statusText = entry.completed ? '✅ Completada' : '🔄 Incompleta';

    // 2. Añadimos el nuevo texto al final de la línea
             li.textContent = `Fecha: ${date}, Lección: ${entry.lessonName}, Tarea: ${entry.taskName}, Puntos: ${entry.score} | Estado: ${statusText}`;
                ul.appendChild(li);
            });
            progressHistoryContainer.appendChild(ul);
            
        } catch (error) {
            progressHistoryContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
            console.error("Error:", error);
        }
    }

    // Evento del botón para volver a la lista
    btnBackToList.addEventListener('click', () => {
        studentProgressSection.style.display = 'none';
        studentListContainer.style.display = 'block';
    });

    // Evento para añadir un nuevo alumno al enviar el formulario
    // REEMPLAZA LA FUNCIÓN COMPLETA DEL FORMULARIO CON ESTA

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = studentNameInput.value;
    const email = studentEmailInput.value;
    const password = 'password123';
    statusMessage.textContent = "Añadiendo alumno...";
    statusMessage.style.color = "black";

    if (!email.endsWith('@europaschool.org')) {
        statusMessage.textContent = "Error: El correo debe terminar en @europaschool.org";
        statusMessage.style.color = "red";
        return;
    }

    try {
        // NOTA: Tu API para registrar un usuario es '/api/users/register'.
        // He corregido la ruta aquí también.
        const response = await fetch(`${API_BASE_URL}/api/users/register`, { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, password, role: 'student' })
        });
        
        const data = await response.json();

        if (response.ok) {
            // La respuesta de tu API de registro no devuelve data.user.name,
            // así que usamos el nombre que ya tenemos.
            statusMessage.textContent = `¡Alumno ${name} añadido con éxito!`;
            statusMessage.style.color = "green";
            form.reset();
            await fetchAndDisplayStudents(); // Refresca la lista de alumnos
        } else {
            statusMessage.textContent = `Error al añadir alumno: ${data.message}`;
            statusMessage.style.color = "red";
        }
    } catch (error) { // <-- ESTE ES EL BLOQUE QUE FALTABA
        statusMessage.textContent = "Error de red. Intenta de nuevo más tarde.";
        statusMessage.style.color = "red";
        console.error("Error:", error);
    }
});

    // Carga inicial de los alumnos
    fetchAndDisplayStudents();
});
