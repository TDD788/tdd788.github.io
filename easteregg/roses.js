// roses
function startViewer(regions) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const proposalText = document.getElementById('proposal');
    const answerButtons = document.getElementById('answer-buttons');
    const btnSi = document.querySelector('.btn-si');
    const btnNo = document.querySelector('.btn-no');
    const genderSelection = document.querySelector('.centered');
    const container = document.querySelector('.container');

    // Variables de estado
    let isSadMode = false;
    let isProposalShown = false;
    let halfBuilt = false;
    let genderSelected = false;
    let animationPaused = false;

    // Ajustar resolución
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Centro y escala
    const allPoints = regions.flatMap(r => r.contour);
    const xs = allPoints.map(p => p[0]);
    const ys = allPoints.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const scale = Math.min(
        (window.innerWidth * 0.8) / (maxX - minX),
        (window.innerHeight * 0.8) / (maxY - minY)
    );

    let builtRegions = [];
    let rotationImage = null;

    let currentIndex = 0;
    function animateBuild() {
        if (animationPaused || !genderSelected) return;
        
        if (currentIndex >= regions.length) {
            // Captura del dibujo completo para rotar
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);
            rotationImage = tempCanvas;

            if (!isSadMode) {
                requestAnimationFrame(rotateDraw);
            }
            return;
        }

        builtRegions.push(regions[currentIndex]);
        currentIndex++;
        
        // Mostrar propuesta cuando esté a la mitad
        // Mostrar propuesta solo cuando se termine de dibujar todo
if (currentIndex >= regions.length) {
    const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, 0, 0);
            rotationImage = tempCanvas;

            if (genderSelected) {
                showProposal();
            } else {
                animationPaused = true;
                applyGrayEffect();
                createBrokenPetals();
            }

            if (!isSadMode) {
                requestAnimationFrame(rotateDraw);
            }
            return;
        }
        
        drawStatic(builtRegions);
        setTimeout(animateBuild, 60);
    }

    function drawStatic(regionsToDraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        for (const region of regionsToDraw) {
            const points = region.contour;
            if (points.length < 3) continue;

            const xs = points.map(p => p[0]);
            const ys = points.map(p => p[1]);
            const w = Math.max(...xs) - Math.min(...xs);
            const h = Math.max(...ys) - Math.min(...ys);
            const area = w * h;
            const totalArea = (maxX - minX) * (maxY - minY);
            if (area > totalArea * 0.5) continue;

            let r, g, b;
            if (isSadMode || !genderSelected) {
                // Modo triste o no seleccionado: convertir a escala de grises
                const avg = region.color.reduce((a, c) => a + c, 0) / 3 * 255;
                r = g = b = Math.round(avg * 0.3); // Tonos oscuros
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
    }

    let angle = 0;
    function rotateDraw() {
        if (isSadMode || !genderSelected || animationPaused) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(rotationImage, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();

        angle = (angle + 0) % 360;
        requestAnimationFrame(rotateDraw);
    }

    function showProposal() {
        if (isProposalShown) return;
        isProposalShown = true;
        
        // Personalizar mensaje según género
        const isFemale = document.getElementById('btn-chica').classList.contains('selected');
        proposalText.textContent = isFemale ? 
            "¿Queres ser mi novia?" : 
            "¿Queres ser mi novio?";
        
        overlay.classList.add('visible');
        answerButtons.classList.remove('hidden');
        
        // Configurar eventos para los botones de respuesta
        btnSi.addEventListener('click', handlePositiveResponse);
        btnNo.addEventListener('click', handleNegativeResponse);
    }

    function handlePositiveResponse() {
        // Efectos felices
        sendResultsToEmail();
        createConfetti();
        createPetals('happy');
        answerButtons.classList.add('hidden');
        
        // Continuar con la animación
        setTimeout(() => {
            animateBuild();
        }, 2000);
    }

    function handleNegativeResponse() {
        isSadMode = true;
        sendResultsToEmail();
        createBrokenPetals();
        drawStatic(builtRegions); // Redibujar en modo triste
        
        // Deshabilitar botón No y cambiar estilo
        btnNo.disabled = true;
        btnNo.textContent = "😢";
        btnNo.style.background = "#333";
        btnNo.style.boxShadow = "none";
        
        // Cambiar texto de propuesta
        proposalText.textContent = "Bueno...";
        proposalText.style.color = "#aaa";
        proposalText.style.textShadow = "0 0 10px #555";
    }

    function applyGrayEffect() {
        // Aplicar filtro de escala de grises a todo el contenedor
        container.style.filter = "grayscale(80%) brightness(0.7)";
        container.style.transition = "filter 1.5s ease";
    }

    function createBrokenPetals() {
        const container = document.querySelector('.petal-overlay');
        const petalCount = 50;
        
        // Limpiar pétalos existentes
        container.innerHTML = '';
        
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.classList.add('petal');
            
            // Estilo de pétalo roto
            petal.style.backgroundColor = `hsl(0, 0%, ${20 + Math.random() * 30}%)`;
            petal.style.borderRadius = '2px';
            petal.style.opacity = 0.7;
            
            // Crear efecto de pétalo roto
            if (Math.random() > 0.5) {
                petal.style.clipPath = "polygon(0% 0%, 100% 0%, 60% 50%, 0% 100%)";
            } else {
                petal.style.clipPath = "polygon(40% 0%, 100% 50%, 60% 100%, 0% 50%)";
            }
            
            // Tamaño aleatorio
            const size = 5 + Math.random() * 15;
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            
            // Posición inicial
            const startX = Math.random() * 100;
            petal.style.left = `${startX}%`;
            petal.style.top = '-10px';
            
            // Animación con movimiento irregular
            const duration = 8 + Math.random() * 12;
            const delay = Math.random() * 5;
            petal.style.animation = `
                fall-broken ${duration}s linear ${delay}s infinite
            `;
            
            container.appendChild(petal);
        }
        
        // Agregar animaciones CSS dinámicamente
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall-broken {
                0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
                50% { transform: translateY(50vh) rotate(${Math.random() * 180}deg) translateX(${Math.random() * 50}px); opacity: 0.4; }
                100% { transform: translateY(100vh) rotate(${Math.random() * 360}deg) scale(0.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Configurar botones de género
    const btnChico = document.getElementById('btn-chico');
    const btnChica = document.getElementById('btn-chica');
    
    btnChico.addEventListener('click', () => {
        genderSelected = true;
        btnChico.classList.add('selected');
        btnChica.classList.remove('selected');
        genderSelection.classList.add('hidden');
        animateBuild();
    });
    
    btnChica.addEventListener('click', () => {
        genderSelected = true;
        btnChica.classList.add('selected');
        btnChico.classList.remove('selected');
        genderSelection.classList.add('hidden');
        animateBuild();
    });

    // Iniciar animación (pero se pausará si no se selecciona género)
    animateBuild();
}

// Cargar JSON y lanzar
fetch('roses.json')
  .then(res => res.json())
  .then(startViewer)
  .catch(err => {
    console.error("❌ Error cargando JSON:", err);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText('Error cargando roses.json', 20, 40);
  });
