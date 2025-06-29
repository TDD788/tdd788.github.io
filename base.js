let recipientName = '';
let senderName = '';
let senderGender = '';
let response = '';
let responseTimestamp = '';
let isSadMode = false;
let isProposalShown = false;
let halfBuilt = false;
let genderSelected = false;
let animationPaused = false;
let builtRegions = [];
let rotationImage = null;
let currentIndex = 0;
let angle = 0;
let animateBuild, drawStatic;
let regionsData = null;
let animationTimeout = null;
let isRotationStarted = false;
let rotateDrawFunction = null;
let isAnimationComplete = false;
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
const confirmRecipientBtn = document.getElementById('confirm-recipient');
const confirmSenderBtn = document.getElementById('confirm-sender');
const btnChico = document.getElementById('btn-chico');
const btnChica = document.getElementById('btn-chica');
const btnSi = document.querySelector('.btn-si');
const btnNo = document.querySelector('.btn-no');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const proposalText = document.getElementById('proposal');
const container = document.querySelector('.container');
const genderSelection = document.querySelector('.centered');
let canvasW = 0;
let canvasH = 0;

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setupEventListeners();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    fetch('roses.json')
      .then(res => res.json())
      .then(startViewer)
      .catch(err => {
          console.error("❌ Error cargando JSON:", err);
          ctx.fillStyle = 'white';
          ctx.font = '20px monospace';
          ctx.fillText('Error cargando roses.json', 20, 40);
      });
});

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvasW = canvas.clientWidth;
    canvasH = canvas.clientHeight;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

function createRotationImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    rotationImage = tempCanvas;
}

function setupEventListeners() {
    confirmRecipientBtn.addEventListener('click', handleRecipientConfirmation);
    recipientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRecipientConfirmation();
    });
    confirmSenderBtn.addEventListener('click', handleSenderConfirmation);
    senderNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSenderConfirmation();
    });
    btnChico.addEventListener('click', () => {
        senderGender = 'male';
        genderSelected = true;
        btnChico.classList.add('selected');
        btnChica.classList.remove('selected');
        startExperience();
    });
    btnChica.addEventListener('click', () => {
        senderGender = 'female';
        genderSelected = true;
        btnChica.classList.add('selected');
        btnChico.classList.remove('selected');
        startExperience();
    });
    btnSi.addEventListener('click', handlePositiveResponse);
    btnNo.addEventListener('click', handleNegativeResponse);
    document.addEventListener('keydown', handleKeyPress);
}

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
    nameScreen.classList.add('hidden');
    senderScreen.classList.remove('hidden');
}

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

function handleKeyPress(e) {
    if (e.key === 's' || e.key === 'S') {
        skipAnimation();
    }
}

function skipAnimation() {
    if (genderSelected && !isProposalShown && regionsData && currentIndex < regionsData.length) {
        clearTimeout(animationTimeout);
        currentIndex = regionsData.length;
        builtRegions = [...regionsData];
        drawStatic(builtRegions);
        createRotationImage();
        isRotationStarted = true;
        isAnimationComplete = true;
        requestAnimationFrame(rotateDrawFunction);
        showProposal();
    }
}

function startExperience() {
    genderScreen.classList.add('hidden');
    overlay.classList.remove('hidden');
    const proposalText = `¿${recipientName}, quieres ser mi novi${senderGender === 'male' ? 'o' : 'a'}?`;
    document.getElementById('proposal').textContent = proposalText;
    if (regionsData) {
        animateBuild();
    }
}

function startViewer(regions) {
    regionsData = regions;
    const allPoints = regions.flatMap(r => r.contour);
    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    centerX = (minX + maxX) / 2;
    centerY = (minY + maxY) / 2;
    scale = Math.min(
        (window.innerWidth * 0.8) / (maxX - minX),
        (window.innerHeight * 0.8) / (maxY - minY)
    );
    animateBuild = function() {
        if (animationPaused || !genderSelected) return;
        if (currentIndex >= regions.length) {
            createRotationImage();
            isRotationStarted = true;
            isAnimationComplete = true;
            requestAnimationFrame(rotateDrawFunction);
            showProposal();
            return;
        }
        builtRegions.push(regions[currentIndex]);
        currentIndex++;
        if (currentIndex >= regions.length) {
            createRotationImage();
            isRotationStarted = true;
            isAnimationComplete = true;
            requestAnimationFrame(rotateDrawFunction);
            showProposal();
            return;
        }
        drawStatic(builtRegions);
        animationTimeout = setTimeout(animateBuild, 60);
    };
    drawStatic = function(regionsToDraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvasW / 2, canvasH / 2);
        for (const region of regionsToDraw) {
            const points = region.contour;
            if (points.length < 3) continue;
            const xs = points.map(p => p[0]);
            const ys = points.map(p => p[1]);
            const w = Math.max(...xs) - Math.min(...xs);
            const h = Math.max(...ys) - Math.min(...ys);
            const area = w * h;
            const totalArea = (canvas.width * canvas.height) / (window.devicePixelRatio ** 2);
            if (area > totalArea * 0.8) continue;
            let r, g, b;
            if (isSadMode || !genderSelected) {
                const avg = region.color.reduce((a, c) => a + c, 0) / 3 * 255;
                r = g = b = Math.round(avg * 0.3);
            } else {
                [r, g, b] = region.color.map(c => Math.round(c * 255));
            }
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                const x = (points[i][0] - centerX) * scale;
                const y = (centerY - points[i][1]) * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };
    rotateDrawFunction = function rotateDraw() {
        if (isSadMode || !genderSelected || animationPaused) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvasW / 2, canvasH / 2);
        ctx.rotate((angle * Math.PI) / 180);
        if (rotationImage) {
            ctx.drawImage(rotationImage, -canvasW / 2, -canvasH / 2, canvasW, canvasH);
        }
        ctx.restore();
        angle = (angle + 0.2) % 360;
        requestAnimationFrame(rotateDrawFunction);
    };
    function applyGrayEffect() {
        container.style.filter = "grayscale(80%) brightness(0.7)";
        container.style.transition = "filter 1.5s ease";
    }

    if (genderSelected) {
        animateBuild();
    }
}

function showProposal() {
    isProposalShown = true;
    proposalText.textContent = `¿${recipientName}, quieres ser mi novi${senderGender === 'male' ? 'o' : 'a'}?`;
    overlay.classList.add('visible');
    setTimeout(() => {
        answerButtons.classList.remove('hidden');
    }, 1000);
}

function handlePositiveResponse() {
    if (!isProposalShown) return;
    answerButtons.classList.add('hidden');
    response = 'Sí';
    responseTimestamp = new Date().toISOString();
    createHearts();
    createConfetti();
    createPetals('happy')
    proposal.textContent = `¡${recipientName}, Gracias! 💖`;
    setTimeout(() => {
        overlay.classList.add('hidden');
        finalScreen.classList.remove('hidden');
        finalMessage.textContent = `¡Felicidades ${recipientName} y ${senderName}!`;        
        sendResultsToEmail();
    }, 3000);
}

function handleNegativeResponse() {
    if (!isProposalShown) return;
    answerButtons.classList.add('hidden');
    response = 'No';
    responseTimestamp = new Date().toISOString();
    isSadMode = true;
    document.body.style.background = 'black';
    overlay.style.background = 'rgba(0, 0, 0, 0.8)';
    createBrokenPetals();
    drawStatic(builtRegions);
    btnNo.disabled = true;
    btnNo.textContent = "😢";
    btnNo.style.background = "#333";
    btnNo.style.boxShadow = "none";
    proposal.textContent = "Bueno...";
    proposal.style.color = "#aaa";
    proposal.style.textShadow = "0 0 10px #555";
    sendResultsToEmail();
}

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

function createPetals(type) {
    const container = document.querySelector('.petal-overlay');
    container.innerHTML = '';
    const colors = type === 'happy'
        ? ['#ff66cc', '#ff3399', '#ff0066', '#ff99cc']
        : ['#555', '#333', '#111', '#444'];
    const petalCount = 35;
    const petals = [];
    const speedMultiplier = isMobileDevice() ? 1.8 : 1.0;
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
            
            vx: Math.random() * 1 - 0.5,
            vy: (1 + Math.random() * 1.5) * speedMultiplier,
            swayPhase: Math.random() * Math.PI * 2,
            size: size
        });
    }

    function animatePetals() {
        for (const p of petals) {
            const sway = Math.sin(p.swayPhase) * 0.8;
            p.swayPhase += 0.05;
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (1 - dist / 120) * 0.08;
                p.vx += dx * force * 0.02;
                p.vy += dy * force * 0.008;
            }
            p.vy += 0.03 * speedMultiplier;
            p.x += p.vx + sway;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
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
    const petalCount = 40 + Math.floor(Math.random() * 16);
    const petals = [];
    const speedMultiplier = isMobileDevice() ? 1.8 : 1.0;
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
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.position = 'absolute';
        petal.style.left = `${x}px`;
        petal.style.top = `${y}px`;
        petal.style.opacity = 0.7;
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        petal.style.zIndex = 999;
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
    container.innerHTML = '';
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        const startX = Math.random() * 100;
        heart.style.left = `${startX}%`;
        heart.style.top = '100%';
        const size = 10 + Math.random() * 20;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        const colors = ['#ff0066', '#ff3399', '#ff66cc'];
        heart.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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
    container.innerHTML = '';
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const size = 5 + Math.random() * 10;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        const originX = Math.random() < 0.33
            ? '0%'
            : (Math.random() < 0.5 ? '50%' : '100%');
        confetti.style.position = 'absolute';
        confetti.style.left = originX;
        confetti.style.bottom = '0px';
        const translateX = (Math.random() - 0.5) * 200;
        const translateY = -200 - Math.random() * 200;
        const rotation = Math.random() * 720 - 360;
        const duration = 3 + Math.random() * 2;
        confetti.style.animation = `confetti-pop-${i} ${duration}s ease-out forwards`;
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

async function sendResultsToEmail() {
    try {
        emailjs.init('TvUXS6A7728U1RtOd');
        if (!recipientName || !senderName || !response) {
            console.error('Faltan datos obligatorios');
            return false;
        }
        let response_color = '#3498db';
        if (response.toLowerCase() === 'sí') {
            response_color = '#27ae60';
        } else if (response.toLowerCase() === 'no') {
            response_color = '#e74c3c';
        }
        const emoji = response.toLowerCase() === 'sí' ? '💖' : '💔';
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
            emoji: emoji
        };
        const emailResponse = await emailjs.send(
            'service_m4imh7n',
            'template_40o3wty',
            templateParams
        );
        console.log('📧 Correo enviado exitosamente:', emailResponse.status);
        return true;
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error);
        return false;
    }
}
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
    </style>
`);