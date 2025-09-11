document.addEventListener("DOMContentLoaded", () => {
    const btnAcceder = document.getElementById('btn-acceder'); // <-- Seleccionar el botón
    const inputEmail = document.getElementById('input-email');
    const inputPassword = document.getElementById('input-password');
    const statusMessage = document.getElementById('status-message');
    const dominioPermitido = "@europaschool.org";

    if (btnAcceder) { // <-- Ahora el "if" comprueba el botón
        btnAcceder.addEventListener('click', async (e) => { // <-- Escuchar el evento 'click'
            e.preventDefault();
            const email = inputEmail.value.trim();
            const password = inputPassword.value;

            // ... el resto de tu código es exactamente igual
            if (!email.endsWith(dominioPermitido)) {
                if (statusMessage) {
                    statusMessage.textContent = `Correo incorrecto: debe terminar en ${dominioPermitido}`;
                    statusMessage.style.color = 'red';
                }
                return;
            }

           try {
    // La función fetch ENVUELVE tanto la URL como el objeto de opciones
    const response = await fetch('https://ls-api-b1.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    }); // <-- El paréntesis del fetch se cierra aquí, después de todas las opciones.

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
    }

    if (data.user.role === 'student') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.location.href = 'index.html';
    } else if (data.user.role === 'teacher') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('userData', JSON.stringify(data.user));
        window.location.href = 'teacher.html';
    }
    // ...
} catch (error) {
    console.error("Error al iniciar sesión:", error);
    if (statusMessage) {
        statusMessage.textContent = error.message;
        statusMessage.style.color = 'red';
    }
}
        });
    }
});
