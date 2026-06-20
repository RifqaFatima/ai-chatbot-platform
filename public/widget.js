(function () {
  const script = document.currentScript;
  const chatbotId = script.getAttribute("data-chatbot-id");
  const serverUrl = script.getAttribute("data-server-url") || window.location.origin;

  if (!chatbotId) {
    console.error("Chatbot widget: missing data-chatbot-id attribute");
    return;
  }

  const currentDomain = window.location.hostname;

  let isOpen = false;
  let socket = null;
  let messages = [];

  // ---- Inject styles ----
  const style = document.createElement("style");
  style.textContent = `
    .cwb-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      transition: transform 0.2s;
    }
    .cwb-bubble:hover {
      transform: scale(1.05);
    }
    .cwb-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 360px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .cwb-window.cwb-open {
      display: flex;
    }
    .cwb-header {
      background: #2563eb;
      color: white;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .cwb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cwb-msg {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .cwb-msg-user {
      align-self: flex-end;
      background: #2563eb;
      color: white;
    }
    .cwb-msg-assistant {
      align-self: flex-start;
      background: white;
      border: 1px solid #e5e7eb;
      color: #111827;
    }
    .cwb-input-area {
      display: flex;
      gap: 6px;
      padding: 10px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }
    .cwb-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 13px;
      outline: none;
      font-family: inherit;
    }
    .cwb-send-btn {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .cwb-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .cwb-empty {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 40px;
    }
  `;
  document.head.appendChild(style);

  // ---- Build DOM elements ----
  const bubble = document.createElement("div");
  bubble.className = "cwb-bubble";
  bubble.innerHTML = "💬";

  const chatWindow = document.createElement("div");
  chatWindow.className = "cwb-window";
  chatWindow.innerHTML = `
    <div class="cwb-header">Chat with us</div>
    <div class="cwb-messages" id="cwb-messages">
      <div class="cwb-empty">Ask us anything</div>
    </div>
    <div class="cwb-input-area">
      <input class="cwb-input" id="cwb-input" placeholder="Type a message..." />
      <button class="cwb-send-btn" id="cwb-send">Send</button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(chatWindow);

  const messagesEl = chatWindow.querySelector("#cwb-messages");
  const inputEl = chatWindow.querySelector("#cwb-input");
  const sendBtn = chatWindow.querySelector("#cwb-send");

  // ---- Toggle open/close ----
  bubble.addEventListener("click", () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle("cwb-open", isOpen);

    if (isOpen && !socket) {
      connectSocket();
    }
  });

  // ---- Render messages ----
  function renderMessages() {
    if (messages.length === 0) {
      messagesEl.innerHTML = `<div class="cwb-empty">Ask us anything</div>`;
      return;
    }

    messagesEl.innerHTML = messages
      .map(
        (m) =>
          `<div class="cwb-msg cwb-msg-${m.role === "user" ? "user" : "assistant"}">${escapeHtml(m.content)}</div>`
      )
      .join("");

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Socket connection ----
  function connectSocket() {
    const loaderScript = document.createElement("script");
    loaderScript.src = serverUrl + "/socket.io/socket.io.js";
    loaderScript.onload = () => {
      socket = io(serverUrl, { path: "/socket.io" });

      socket.on("widget_receive_message", (data) => {
        sendBtn.disabled = false;

        if (data.error) {
          messages.push({ role: "assistant", content: data.error });
        } else {
          messages.push({ role: "assistant", content: data.response });
        }
        renderMessages();
      });
    };
    document.head.appendChild(loaderScript);
  }

  // ---- Send message ----
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || !socket) return;

    const history = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    messages.push({ role: "user", content: text });
    renderMessages();
    inputEl.value = "";
    sendBtn.disabled = true;

    socket.emit("widget_send_message", {
      chatbotId,
      message: text,
      history,
      domain: currentDomain,
    });
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();