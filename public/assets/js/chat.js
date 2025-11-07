// chat.js - Final Corrigido
document.addEventListener('DOMContentLoaded', () => {
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const nicknameArea = document.getElementById('nickname-area');
    const messagesArea = document.getElementById('messages-area');
    const nicknameInput = document.getElementById('nickname-input');
    const saveNicknameBtn = document.getElementById('save-nickname-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messages = document.getElementById('messages');

    let currentNickname = window.initialNickname || 'Anônimo';
    
    // Tenta carregar o apelido do localStorage se já tiver sido salvo
    const savedNickname = localStorage.getItem('chatNickname');
    if (savedNickname) {
        currentNickname = savedNickname;
        // Se o apelido foi salvo, já mostra a área de mensagens
        if (nicknameArea && messagesArea) {
            nicknameArea.style.display = 'none';
            messagesArea.style.display = 'flex';
        }
    }
    
    // 1. VERIFICAÇÃO CRÍTICA: Se o usuário não está logado, #chat-icon não existe.
    // A lógica do chat para usuários logados NÃO DEVE rodar.
    if (!chatIcon) {
        return;
    }

    // 2. INICIALIZAÇÃO: A partir daqui, o usuário está logado.
    const socket = io();

    // 3. EVENTO DE CLIQUE: Onde o erro estava.
    chatIcon.addEventListener('click', () => {
        // Alterna entre 'flex' (visível) e 'none' (escondido)
        // O display do chat-window deve ser 'flex' para ser visível, conforme o CSS
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    // 4. Salvar Apelido
    if (saveNicknameBtn) {
        saveNicknameBtn.addEventListener('click', () => {
            const newNickname = nicknameInput.value.trim();
            if (newNickname) {
                currentNickname = newNickname;
                localStorage.setItem('chatNickname', newNickname);
                
                // Esconde a área de escolha e mostra a de mensagens
                if (nicknameArea && messagesArea) {
                    nicknameArea.style.display = 'none';
                    messagesArea.style.display = 'flex';
                }
            } else {
                alert('Por favor, digite um apelido válido.');
            }
        });
    }

    // 5. Enviar mensagem
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            
            if (!currentNickname) {
                alert('Por favor, escolha um apelido primeiro.');
                return;
            }

            if (!msg) return;
            
            socket.emit('chat message', { nickname: currentNickname, msg });
            chatInput.value = '';
        });
    }

    // 6. Receber mensagem
    socket.on('chat message', (data) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${data.nickname}:</strong> ${data.msg}`;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    });
});