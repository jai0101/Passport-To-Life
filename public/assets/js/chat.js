document.addEventListener('DOMContentLoaded', () => {
    if (!window.loggedIn) return; // Não mostra chat se não estiver logado

    // Cria o ícone flutuante
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chat-icon';
    chatIcon.textContent = '💬';
    document.body.appendChild(chatIcon);

    // Cria a janela do chat (inicialmente escondida)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.display = 'none';
    chatWindow.innerHTML = `
        <ul id="messages"></ul>
        <form id="form">
            <input id="input" autocomplete="off" placeholder="Digite sua mensagem..." />
            <button type="submit">Enviar</button>
        </form>
    `;
    document.body.appendChild(chatWindow);

    // Estilos do chat
    const style = document.createElement('style');
    style.textContent = `
        #chat-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #7d3617;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 30px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 9999;
        }
        #chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 9999;
        }
        #messages {
            list-style: none;
            margin: 0;
            padding: 10px;
            flex-grow: 1;
            overflow-y: auto;
        }
        #messages li:nth-child(odd) { background: #efefef; }
        #form { display: flex; padding: 5px; background: #f1f1f1; border-top: 1px solid #ccc; }
        #input { flex-grow: 1; padding: 5px 10px; margin-right: 5px; border-radius: 5px; border: 1px solid #ccc; }
        #form button { padding: 5px 10px; background: #007bff; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
        #form button:hover { background: #0056b3; }
    `;
    document.head.appendChild(style);

    // Toggle janela
    chatIcon.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    // Conexão Socket.IO
    const socket = io();
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!input.value) return;

        socket.emit('chat message', { msg: input.value });
        input.value = '';
    });

    socket.on('chat message', (data) => {
        const item = document.createElement('li');
        const nicknameSpan = document.createElement('span');
        nicknameSpan.classList.add('nickname');
        nicknameSpan.style.fontWeight = 'bold';
        nicknameSpan.style.color = '#007bff';
        nicknameSpan.textContent = data.nickname + ': ';
        item.appendChild(nicknameSpan);
        item.appendChild(document.createTextNode(data.msg));
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    });
});
