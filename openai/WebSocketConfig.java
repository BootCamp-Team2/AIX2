<!DOCTYPE html>
<html>
<head>
    <title>Chat Assistant</title>
</head>
<body>
    <h1>Chat with Assistant</h1>
    <div id="chat-box" style="border: 1px solid #000; width: 50%; height: 300px; overflow-y: scroll; margin-bottom: 20px;"></div>
    <input type="text" id="message" placeholder="Type your message here..." style="width: 45%;">
    <button onclick="sendMessage()">Send</button>

    <script>
        const ws = new WebSocket("ws://localhost:8080/ws/chat");
        const chatBox = document.getElementById("chat-box");

        ws.onmessage = function(event) {
            const message = event.data;
            const div = document.createElement("div");
            div.textContent = message;
            chatBox.appendChild(div);
        };

        function sendMessage() {
            const messageInput = document.getElementById("message");
            const message = messageInput.value;
            ws.send(message);
            messageInput.value = "";
        }
    </script>
</body>
</html>
