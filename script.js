// script.js - Lógica para gerar e gerenciar o chaveamento dinâmico

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-chaveamento');
    const numCompetidoresInput = document.getElementById('num-competidores');
    const nomesContainer = document.getElementById('nomes-container');
    const bracketContainer = document.getElementById('bracket-container');
    const modal = document.getElementById('modal-comemoracao');
    const mensagemCampeao = document.getElementById('mensagem-campeao');
    const closeModal = document.querySelector('.close');

    let competidores = [];
    let bracket = [];
    let campeao = null;
    let totalRounds = 0; // Número total de rodadas calculado antecipadamente

    // Fechar modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Atualizar campos de nomes baseado no número de competidores
    numCompetidoresInput.addEventListener('input', function() {
        const num = parseInt(this.value);
        if (num < 2 || num > 32) {
            alert('Número de competidores deve ser entre 2 e 32.');
            this.value = 4; // Resetar para 4
            return;
        }
        nomesContainer.innerHTML = '';
        for (let i = 1; i <= num; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nome do Competidor ${i}`;
            input.required = true;
            nomesContainer.appendChild(input);
        }
    });

    // Inicializar com 4 campos
    numCompetidoresInput.value = 4;
    numCompetidoresInput.dispatchEvent(new Event('input'));

    // Gerar chaveamento
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const num = parseInt(numCompetidoresInput.value);
        competidores = Array.from(nomesContainer.querySelectorAll('input')).map(input => input.value.trim()).filter(name => name);

        if (competidores.length !== num) {
            alert('Preencha todos os nomes dos competidores.');
            return;
        }

        // Embaralhar competidores aleatoriamente
        competidores = competidores.sort(() => Math.random() - 0.5);

        // Resetar
        campeao = null;
        bracket = [];
        totalRounds = Math.ceil(Math.log2(num)); // Calcular total de rodadas antecipadamente

        // Gerar primeira rodada
        generateFirstRound();
        renderBracket();
    });

    // Gerar primeira rodada com byes se necessário
    function generateFirstRound() {
        let round = [];
        let remaining = [...competidores];

        // Aplicar bye se ímpar
        if (remaining.length % 2 !== 0) {
            const byeIndex = Math.floor(Math.random() * remaining.length);
            const byePlayer = remaining.splice(byeIndex, 1)[0];
            round.push({ player1: byePlayer, player2: null, winner: null, isBye: true });
        }

        // Agrupar em pares
        for (let i = 0; i < remaining.length; i += 2) {
            round.push({
                player1: remaining[i],
                player2: remaining[i + 1] || null,
                winner: null,
                isBye: false
            });
        }

        bracket.push(round);
    }

    // Gerar próxima rodada com avançados (vencedores + byes)
    function generateNextRound() {
        const lastRound = bracket[bracket.length - 1];
        const avancados = [];

        // Coletar vencedores dos matches e byes
        lastRound.forEach(match => {
            if (match.isBye) {
                avancados.push(match.player1); // Bye avança como jogador
            } else if (match.winner) {
                avancados.push(match.winner);
            }
        });

        if (avancados.length <= 1) {
            campeao = avancados[0];
            mostrarComemoracao();
            return;
        }

        let round = [];
        let remaining = [...avancados];

        // Aplicar bye se ímpar
        if (remaining.length % 2 !== 0) {
            const byeIndex = Math.floor(Math.random() * remaining.length);
            const byePlayer = remaining.splice(byeIndex, 1)[0];
            round.push({ player1: byePlayer, player2: null, winner: null, isBye: true });
        }

        // Agrupar em pares
        for (let i = 0; i < remaining.length; i += 2) {
            round.push({
                player1: remaining[i],
                player2: remaining[i + 1] || null,
                winner: null,
                isBye: false
            });
        }

        bracket.push(round);
        renderBracket();
    }

    // Renderizar o bracket
    function renderBracket() {
        bracketContainer.innerHTML = '';
        bracket.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            roundDiv.innerHTML = `<h3>${getRoundName(roundIndex + 1, totalRounds)}</h3>`;
            
            round.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                
                const p1 = document.createElement('div');
                p1.className = 'player';
                p1.textContent = match.player1 || 'TBD';
                if (match.isBye) {
                    p1.classList.add('bye');
                    p1.textContent += ' (Bye)';
                } else if (match.player1 && !match.winner && match.player2) {
                    p1.addEventListener('click', () => selectWinner(roundIndex, matchIndex, match.player1));
                }
                
                const p2 = document.createElement('div');
                p2.className = 'player';
                p2.textContent = match.player2 || 'TBD';
                if (match.player2 && !match.winner) {
                    p2.addEventListener('click', () => selectWinner(roundIndex, matchIndex, match.player2));
                }
                
                if (match.winner && !match.isBye) {
                    if (match.player1 === match.winner) p1.classList.add('winner');
                    if (match.player2 === match.winner) p2.classList.add('winner');
                }
                
                matchDiv.appendChild(p1);
                if (match.player2) matchDiv.appendChild(p2);
                roundDiv.appendChild(matchDiv);
            });
            
            bracketContainer.appendChild(roundDiv);
        });
    }

    // Selecionar vencedor
    function selectWinner(roundIndex, matchIndex, winner) {
        bracket[roundIndex][matchIndex].winner = winner;
        
        // Verificar se todos os matches da rodada têm vencedor
        const round = bracket[roundIndex];
        if (round.every(match => match.winner || match.isBye)) {
            generateNextRound();
        } else {
            renderBracket(); // Re-renderizar para mostrar vencedor
        }
    }

    // Mostrar efeito de comemoração
    function mostrarComemoracao() {
        mensagemCampeao.textContent = `${campeao} é o campeão do Campeonato de Clash Royale!`;
        modal.style.display = 'block';
        modal.classList.add('show');
    }

    // Função auxiliar para nomear as rodadas (usando totalRounds fixo)
    function getRoundName(roundNum, totalRounds) {
        const names = {
            1: 'Final',
            2: ['Semifinais', 'Final'],
            3: ['Quartas', 'Semifinais', 'Final'],
            4: ['Oitavas', 'Quartas', 'Semifinais', 'Final'],
            5: ['16 avos', 'Oitavas', 'Quartas', 'Semifinais', 'Final']
        };
        const roundNames = names[totalRounds] || Array.from({ length: totalRounds }, (_, i) => `Rodada ${i + 1}`);
        return roundNames[roundNum - 1] || `Rodada ${roundNum}`;
    }
});
