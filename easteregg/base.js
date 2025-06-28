// Variables globales
let recipientName = '';
let senderName = '';
let senderGender = '';
let response = '';
let responseTimestamp = '';

// Elementos del DOM
const nameScreen = document.getElementById('name-screen');
const senderScreen = document.getElementById('sender-screen');
const genderScreen = document.getElementById('gender-screen');
const overlay = document.getElementById('overlay');
const proposal = document.getElementById('proposal');
const answerButtons = document.getElementById('answer-buttons');
const finalScreen = document.getElementById('final-screen');
const finalMessage = document.getElementById('final-message');
const resultImage = document.getElementById('result-image');
const recipientNameInput = document.getElementById('recipient-name');
const senderNameInput = document.getElementById('sender-name');
//const recipientNameDisplay = document.getElementById('recipient-name-display');
const confirmRecipientBtn = document.getElementById('confirm-recipient');
const confirmSenderBtn = document.getElementById('confirm-sender');
const btnChico = document.getElementById('btn-chico');
const btnChica = document.getElementById('btn-chica');
const btnSi = document.querySelector('.btn-si');
const btnNo = document.querySelector('.btn-no');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Confirmar nombre del destinatario
    confirmRecipientBtn.addEventListener('click', handleRecipientConfirmation);
    recipientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRecipientConfirmation();
    });

    // Confirmar nombre del remitente
    confirmSenderBtn.addEventListener('click', handleSenderConfirmation);
    senderNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSenderConfirmation();
    });

    // Selección de género
    btnChico.addEventListener('click', () => {
        senderGender = 'male';
        startExperience();
    });
    
    btnChica.addEventListener('click', () => {
        senderGender = 'female';
        startExperience();
    });

    // Botones de respuesta
    btnSi.addEventListener('click', handlePositiveResponse);
    btnNo.addEventListener('click', handleNegativeResponse);
}

// Manejar confirmación del nombre del destinatario
function handleRecipientConfirmation() {
    recipientName = recipientNameInput.value.trim();
    
    if (recipientName === '') {
        recipientNameInput.placeholder = '¡Por favor escribe tu nombre!';
        recipientNameInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            recipientNameInput.style.animation = '';
        }, 500);
        return;
    }
    
    //recipientNameDisplay.textContent = recipientName;
    nameScreen.classList.add('hidden');
    senderScreen.classList.remove('hidden');
}

// Manejar confirmación del nombre del remitente
function handleSenderConfirmation() {
    senderName = senderNameInput.value.trim();
    
    if (senderName === '') {
        senderNameInput.placeholder = '¡Por favor escribe un nombre!';
        senderNameInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            senderNameInput.style.animation = '';
        }, 500);
        return;
    }
    
    senderScreen.classList.add('hidden');
    genderScreen.classList.remove('hidden');
    document.getElementById('gender-question').textContent = `${recipientName}, ¿Sos Hombre o Mujer?`;
}

// Iniciar experiencia principal
function startExperience() {
    genderScreen.classList.add('hidden');
    overlay.classList.remove('hidden');
    const proposalText = `¿${recipientName}, quieres ser mi novi${senderGender === 'male' ? 'a' : 'o'}?`;
    proposal.textContent = proposalText;
    setTimeout(() => {
        answerButtons.classList.remove('hidden');
    }, 2000);
}

function handlePositiveResponse() {
    response = 'Sí';
    responseTimestamp = new Date().toISOString();
    createHearts();
    answerButtons.classList.add('hidden');
    proposal.textContent = `¡${recipientName}, aceptaste ser mi novi${senderGender === 'male' ? 'a' : 'o'}! 💖`;
    setTimeout(() => {
        overlay.classList.add('hidden');
        finalScreen.classList.remove('hidden');
        finalMessage.textContent = `¡Felicidades ${recipientName} y ${senderName}!`;        
        // Enviar resultados por correo
        sendResultsToEmail();
    }, 3000);
}

// Crear estrellas de fondo
function createStars() {
    const container = document.querySelector('.background-stars');
    container.innerHTML = '';
    
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        container.appendChild(star);
    }
}

// Crear corazones animados
function createHearts() {
    const container = document.querySelector('.hearts');
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.classList.add('heart-animation');
            heart.innerHTML = '❤️';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.fontSize = `${Math.random() * 2 + 1}rem`;
            heart.style.animationDuration = `${Math.random() * 4 + 3}s`;
            document.body.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }, i * 200);
    }
}

// Enviar resultados por correo
async function sendResultsToEmail() {
    try {
        // Inicializar EmailJS con tu user ID
        emailjs.init('TvUXS6A7728U1RtOd');

        // Validación básica
        if (!recipientName || !senderName || !response) {
            console.error('Faltan datos obligatorios');
            return false;
        }

        // Determinar color del mensaje según la respuesta
        let response_color = '#3498db'; // neutral
        if (response.toLowerCase() === 'sí') {
            response_color = '#27ae60'; // verde
        } else if (response.toLowerCase() === 'no') {
            response_color = '#e74c3c'; // rojo
        }

        // Determinar emoji para mostrar en el correo
        const emoji = response.toLowerCase() === 'sí' ? '💖' : '💔';

        // Armar parámetros para EmailJS
        const templateParams = {
            recipient_name: recipientName.trim(),
            sender_name: senderName.trim(),
            response: response.trim(),
            gender: senderGender || 'Desconocido',
            date: new Date().toLocaleString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            response_color: response_color,
            emoji: emoji // <-- Agregado para el template
        };

        // Enviar email
        const emailResponse = await emailjs.send(
            'service_m4imh7n', // ID de servicio
            'template_40o3wty', // ID de plantilla
            templateParams
        );

        console.log('📧 Correo enviado exitosamente:', emailResponse.status);
        return true;

    } catch (error) {
        console.error('❌ Error al enviar el correo:', {
            code: error?.status || 'sin código',
            message: error?.text || 'sin mensaje',
            fullError: error
        });
        alert('No se pudo enviar el correo. Revisá la consola para más detalles.');
        return false;
    }
}

function createPetals(type) {
    const container = document.querySelector('.petal-overlay');
    container.innerHTML = '';

    const colors = type === 'happy'
        ? ['#ff66cc', '#ff3399', '#ff0066', '#ff99cc']
        : ['#555', '#333', '#111', '#444'];

    const petalCount = 35;
    const petals = [];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        const size = type === 'happy' ? (10 + Math.random() * 20) : (5 + Math.random() * 15);
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * -window.innerHeight;
        const speedMultiplier = isMobileDevice() ? 1.8 : 1.0;

        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.position = 'absolute';
        petal.style.left = `${x}px`;
        petal.style.top = `${y}px`;
        petal.style.opacity = type === 'happy' ? 0.9 : 0.7;
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        petal.style.borderRadius = type === 'happy' ? '50% 0 50% 50%' : '2px';

        container.appendChild(petal);

        petals.push({
            el: petal,
            x: x,
            y: y,
            
            vx: Math.random() * 1 - 0.5, // deriva lateral inicial
            vy: (1 + Math.random() * 1.5) * speedMultiplier,
            swayPhase: Math.random() * Math.PI * 2, // para movimiento sinusoidal
            size: size
        });
    }

    function animatePetals() {
        for (const p of petals) {
            // Movimiento tipo "zig-zag" lateral
            const sway = Math.sin(p.swayPhase) * 0.8;
            p.swayPhase += 0.05;

            // Atracción leve al mouse
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (1 - dist / 120) * 0.08;
                p.vx += dx * force * 0.02;
                p.vy += dy * force * 0.008;
            }

            // Gravedad suave
            p.vy += 0.03 * speedMultiplier;

            // Movimiento
            p.x += p.vx + sway;
            p.y += p.vy;

            // Suavizado de velocidad
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Reset si sale de pantalla
            if (p.y > window.innerHeight + 50 || p.x < -50 || p.x > window.innerWidth + 50) {
                p.x = Math.random() * window.innerWidth;
                p.y = -20;
                p.vx = Math.random() * 1 - 0.5;
                p.vy = 1 + Math.random() * 1.5;
                p.swayPhase = Math.random() * Math.PI * 2;
            }

            p.el.style.left = `${p.x}px`;
            p.el.style.top = `${p.y}px`;
        }

        requestAnimationFrame(animatePetals);
    }

    animatePetals();
}

function createBrokenPetals() {
    const container = document.querySelector('.petal-overlay');
    container.innerHTML = '';

    const colors = ['#444', '#333', '#222', '#555'];
    const petalCount = 40 + Math.floor(Math.random() * 16); // entre 25 y 40
    const petals = [];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');

        const size = 5 + Math.random() * 20;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * -window.innerHeight;
        const speedMultiplier = isMobileDevice() ? 1.8 : 1.0;

        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.position = 'absolute';
        petal.style.left = `${x}px`;
        petal.style.top = `${y}px`;
        petal.style.opacity = 0.7;
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        petal.style.zIndex = 999;

        // Forma rota
        if (Math.random() < 0.5) {
            petal.style.clipPath = "polygon(0 0, 100% 0, 80% 60%, 20% 100%, 0% 70%)";
        } else {
            petal.style.borderRadius = `${Math.random() * 30}% ${Math.random() * 50}% ${Math.random() * 40}% ${Math.random() * 20}%`;
        }

        container.appendChild(petal);

        petals.push({
            el: petal,
            x: x,
            y: y,
            vx: Math.random() * 1.6 - 0.6,
            vy: (2 + Math.random() * 2) * speedMultiplier,
            swayPhase: Math.random() * Math.PI * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 3
        });
    }

    function animateBrokenPetals() {
        for (const p of petals) {
            const sway = Math.sin(p.swayPhase) * 1.2;
            p.swayPhase += 0.05;

            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (1 - dist / 100) * 0.07;
                p.vx += dx * force * 0.015;
                p.vy += dy * force * 0.01;
            }

            p.vy += 0.03 * speedMultiplier;
            p.rotation += p.rotationSpeed;

            p.x += p.vx + sway;
            p.y += p.vy;

            p.vx *= 0.96;
            p.vy *= 0.96;

            if (p.y > window.innerHeight + 50 || p.x < -50 || p.x > window.innerWidth + 50) {
                p.x = Math.random() * window.innerWidth;
                p.y = -20;
                p.vx = Math.random() * 1.2 - 0.6;
                p.vy = 2 + Math.random() * 2;
                p.swayPhase = Math.random() * Math.PI * 2;
                p.rotation = Math.random() * 360;
            }

            p.el.style.left = `${p.x}px`;
            p.el.style.top = `${p.y}px`;
            p.el.style.transform = `rotate(${p.rotation}deg)`;
        }

        requestAnimationFrame(animateBrokenPetals);
    }

    animateBrokenPetals();
}

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
}

function createHearts() {
    const container = document.querySelector('.hearts');
    const heartCount = 50;
    
    // Limpiar corazones existentes
    container.innerHTML = '';
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        
        // Posición inicial
        const startX = Math.random() * 100;
        heart.style.left = `${startX}%`;
        heart.style.top = '100%';
        
        // Tamaño aleatorio
        const size = 10 + Math.random() * 20;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        
        // Color
        const colors = ['#ff0066', '#ff3399', '#ff66cc'];
        heart.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Animación
        const duration = 1.5 + Math.random() * 3;
        const delay = Math.random() * 2;
        heart.style.animation = `float-up ${duration}s ease-in ${delay}s infinite`;
        
        container.appendChild(heart);
    }
}

function createConfetti() {
    const container = document.querySelector('.petal-overlay');
    const confettiCount = 100;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    // Limpiar los anteriores si querés
    container.innerHTML = '';

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Colores aleatorios
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Tamaño
        const size = 5 + Math.random() * 10;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;

        // Posición de salida (centro, izquierda o derecha inferior)
        const originX = Math.random() < 0.33
            ? '0%' // izquierda
            : (Math.random() < 0.5 ? '50%' : '100%'); // centro o derecha

        confetti.style.position = 'absolute';
        confetti.style.left = originX;
        confetti.style.bottom = '0px';

        // Movimiento aleatorio hacia arriba y después caída
        const translateX = (Math.random() - 0.5) * 200; // -100 a +100 px
        const translateY = -200 - Math.random() * 200;  // -200 a -400 px (subida)
        const rotation = Math.random() * 720 - 360;     // -360° a +360°
        const duration = 3 + Math.random() * 2;         // 3-5s

        // Usamos animación individual por confetti con estilo inline
        confetti.style.animation = `confetti-pop-${i} ${duration}s ease-out forwards`;

        // Creamos animación individual
        const keyframes = `
            @keyframes confetti-pop-${i} {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 1;
                }
                30% {
                    transform: translate(${translateX}px, ${translateY}px) rotate(${rotation / 2}deg);
                    opacity: 1;
                }
                100% {
                    transform: translate(${translateX}px, 100vh) rotate(${rotation}deg);
                    opacity: 0;
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);

        container.appendChild(confetti);
    }
}

// Animación de shake para inputs vacíos
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    </style>
`);
