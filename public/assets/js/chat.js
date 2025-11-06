// public/assets/js/chat.js

document.addEventListener('DOMContentLoaded', () => {

    // Criar o ícone flutuante
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chat-icon';
    chatIcon.textContent = '💬';
    document.body.appendChild(chatIcon);

    // Criar a janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.display = 'none';
    chatWindow.innerHTML = `
        <ul id="messages"></ul>
        <form id="form" action="">
            <input id="nickname" autocomplete="off" placeholder="Seu Apelido" style="width: 100px; flex-grow: 0;" />
            <input id="input" autocomplete="off" placeholder="Digite sua mensagem..." />
            <button type="submit">Enviar</button>
        </form>
    `;
    document.body.appendChild(chatWindow);

    // Estilos CSS
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
        #chat-window #messages {
            list-style: none;
            margin: 0;
            padding: 10px;
            flex-grow: 1;
            overflow-y: auto;
        }
        #chat-window #messages li:nth-child(odd) { background: #ecab96; }
        #chat-window #form {
            display: flex;
            padding: 5px;
            background: #ecab96;
        }
        #chat-window #input {
            flex-grow: 1;
            padding: 5px 10px;
            margin-right: 5px;
        }
        #chat-window #form button {
            padding: 5px 10px;
            background: #7d3617;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #chat-window #form button:hover {
            background: #a16e5d;
        }
    `;
    document.head.appendChild(style);

    // Toggle chat window
    chatIcon.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    // Socket.IO
    const socket = io();

    const form = chatWindow.querySelector('#form');
    const input = chatWindow.querySelector('#input');
    const nicknameInput = chatWindow.querySelector('#nickname');
    const messages = chatWindow.querySelector('#messages');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value && nicknameInput.value) {
            const messageData = { nickname: nicknameInput.value, msg: input.value };
            socket.emit('chat message', messageData);
            input.value = '';
        }
    });

    socket.on('chat message', function(data) {
        const item = document.createElement('li');
        const nicknameSpan = document.createElement('span');
        nicknameSpan.style.fontWeight = 'bold';
        nicknameSpan.style.color = '#7d3617';
        nicknameSpan.textContent = data.nickname + ': ';
        item.appendChild(nicknameSpan);
        item.appendChild(document.createTextNode(data.msg));
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    });

});
