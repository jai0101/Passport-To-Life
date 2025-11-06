document.addEventListener('DOMContentLoaded', () => {

    // Ícone flutuante do chat
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chat-icon';
    chatIcon.textContent = '💬';
    document.body.appendChild(chatIcon);

    // Janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.style.display = 'none';

    const loggedIn = window.loggedIn === 'true';

    chatWindow.innerHTML = loggedIn ? `
        <ul id="messages"></ul>
        <form id="form">
            <input id="nickname" autocomplete="off" placeholder="Seu Apelido" style="width: 100px; flex-grow: 0;" />
            <input id="input" autocomplete="off" placeholder="Digite sua mensagem..." />
            <button type="submit">Enviar</button>
        </form>
    ` : `
        <div id="login-message" style="padding:10px; text-align:center; color:#721c24; background:#f8d7da;">
            Para enviar mensagens no Chat, faça seu <a href="/login">Login</a>.
        </div>
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
        #chat-window button {
            background: #007bff;
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        #chat-window button:hover {
            background: #0056b3;
        }
        #login-message a {
            color: #721c24;
            font-weight: bold;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);

    // Toggle janela do chat
    chatIcon.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    // Socket.io se estiver logado
    if(loggedIn){
        const socket = io();
        const form = chatWindow.querySelector('#form');
        const input = chatWindow.querySelector('#input');
        const nicknameInput = chatWindow.querySelector('#nickname');
        const messages = chatWindow.querySelector('#messages');

        form.addEventListener('submit', e => {
            e.preventDefault();
            if(input.value && nicknameInput.value){
                socket.emit('chat message', { nickname: nicknameInput.value, msg: input.value });
                input.value = '';
            }
        });

        socket.on('chat message', data => {
            const item = document.createElement('li');
            const nick = document.createElement('span');
            nick.style.fontWeight = 'bold';
            nick.style.color = '#007bff';
            nick.textContent = data.nickname + ': ';
            item.appendChild(nick);
            item.appendChild(document.createTextNode(data.msg));
            messages.appendChild(item);
            messages.scrollTop = messages.scrollHeight;
        });
    }
});
