const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos de UI
const uiLevel = document.getElementById('ui-level');
const uiHp = document.getElementById('ui-hp');
const uiXp = document.getElementById('ui-xp');

// Controles
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => { if(keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if(keys.hasOwnProperty(e.key)) keys[e.key] = false; });

// Jogador (Guerreiro Ecológico)
const player = {
    x: 400, y: 225, size: 20, speed: 4,
    hp: 100, maxHp: 100,
    level: 1, xp: 0, xpToNext: 50,
    damage: 25,
    attackCooldown: 0
};

// Inimigos (Monstros de Resíduos/Poluição)
let enemies = [];
function spawnEnemy() {
    enemies.push({
        x: Math.random() * canvas.width,
        y: Math.random() < 0.5 ? -30 : canvas.height + 30, // Nascem fora da tela
        size: 25, speed: 1.5 + (Math.random() * player.level * 0.2), // Ficam mais rápidos
        hp: 50 + (player.level * 10),
        color: '#8d6e63' // Cor de sujeira/poluição
    });
}
setInterval(spawnEnemy, 2000); // Nasce um inimigo a cada 2 segundos

// Sistema de Combate (Clique no Canvas para atacar)
canvas.addEventListener('mousedown', (e) => {
    if (player.attackCooldown > 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Efeito visual do ataque (Raio Purificador)
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Checar colisão do clique com inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const dx = mouseX - enemies[i].x;
        const dy = mouseY - enemies[i].y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < enemies[i].size + 10) { // Hitbox tolerante
            enemies[i].hp -= player.damage;
            if (enemies[i].hp <= 0) {
                enemies.splice(i, 1);
                gainXP(20);
            }
        }
    }
    player.attackCooldown = 15; // Frames de espera
});

function gainXP(amount) {
    player.xp += amount;
    if (player.xp >= player.xpToNext) {
        player.level++;
        player.xp -= player.xpToNext;
        player.xpToNext = Math.floor(player.xpToNext * 1.5);
        player.maxHp += 20;
        player.hp = player.maxHp; // Cura ao subir de nível
        player.damage += 10;
        updateUI();
    }
    updateUI();
}

function updateUI() {
    uiLevel.innerText = player.level;
    uiHp.innerText = player.hp;
    uiXp.innerText = `${player.xp}/${player.xpToNext}`;
}

// Loop Principal do Jogo
function gameLoop() {
    // 1. Atualizar Estado
    if (keys.w || keys.ArrowUp) player.y -= player.speed;
    if (keys.s || keys.ArrowDown) player.y += player.speed;
    if (keys.a || keys.ArrowLeft) player.x -= player.speed;
    if (keys.d || keys.ArrowRight) player.x += player.speed;

    // Manter jogador na tela
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

    if (player.attackCooldown > 0) player.attackCooldown--;

    // Movimento e colisão dos inimigos
    enemies.forEach((enemy, index) => {
        // Inimigo persegue o jogador
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;

        // Dano no jogador
        if (distance < player.size + enemy.size) {
            player.hp -= 0.5; // Dano contínuo se encostar
            updateUI();
            if (player.hp <= 0) {
                alert("O mundo foi engolido pela poluição! Atualize a página para tentar novamente.");
                player.hp = player.maxHp; // Reset simples
                enemies = [];
            }
        }
    });

    // 2. Desenhar Gráficos
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar tela (Fundo escuro via CSS)

    // Desenhar Inimigos (Círculos marrons/cinzas)
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.stroke();
    });

    // Desenhar Jogador (Guerreiro verde)
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    requestAnimationFrame(gameLoop);
}

// Iniciar
updateUI();
gameLoop();
