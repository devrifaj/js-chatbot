/*
 * Floating Chat Widget – Single JS file
 * Drop this into your site via:
 *   <script src="/path/to/chat-widget.js" defer></script>
 * It will inject the chat icon and popup automatically.
 */
(function () {
  const ID_PREFIX = "chatw";

  // 1) Inject styles
  const style = document.createElement("style");
  style.id = `${ID_PREFIX}-style`;
  style.textContent = `
    :root {
      --cw-primary: #6c5ce7;        /* Indigo */
      --cw-primary-2: #a66bff;      /* Accent */
      --cw-bg: #ffffff;
      --cw-text: #1f2937;           /* Slate-800 */
      --cw-muted: #6b7280;          /* Gray-500 */
      --cw-ring: rgba(108,92,231,0.35);
      --cw-shadow: 0 10px 25px rgba(0,0,0,0.15);
      --cw-radius: 16px;
      --cw-radius-lg: 22px;
      --cw-z: 2147483000; /* high z-index */
    }

    /* Floating button */
    #${ID_PREFIX}-fab {
      position: fixed;
      right: 20px;
      bottom: 22px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--cw-primary), var(--cw-primary-2));
      color: white;
      box-shadow: var(--cw-shadow);
      cursor: pointer;
      user-select: none;
      transition: transform .2s ease, box-shadow .2s ease;
      z-index: var(--cw-z);
    }
    #${ID_PREFIX}-fab:hover { transform: translateY(-2px) scale(1.03); }
    #${ID_PREFIX}-fab:active { transform: translateY(0) scale(0.98); }

    /* Icon shape */
    #${ID_PREFIX}-fab svg { width: 26px; height: 26px; }

    /* Backdrop */
    #${ID_PREFIX}-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.35);
      opacity: 0; pointer-events: none; transition: opacity .25s ease;
      z-index: calc(var(--cw-z) - 1);
    }

    /* Popup */
    #${ID_PREFIX}-popup {
      position: fixed; right: 20px; bottom: 90px; width: 340px; max-width: calc(100vw - 40px);
      background: var(--cw-bg); color: var(--cw-text);
      border-radius: var(--cw-radius-lg);
      box-shadow: var(--cw-shadow);
      transform: translateY(20px) scale(.98);
      opacity: 0; pointer-events: none; transition: all .25s ease;
      z-index: var(--cw-z);
      overflow: hidden;
    }

    /* Header */
    #${ID_PREFIX}-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px;
      background: linear-gradient(135deg, var(--cw-primary), var(--cw-primary-2));
      color: white;
    }
    #${ID_PREFIX}-title { font-size: 16px; font-weight: 600; }
    #${ID_PREFIX}-close {
      background: rgba(255,255,255,.18); border: none; color: white; width: 32px; height: 32px;
      border-radius: 10px; cursor: pointer; display: grid; place-items: center;
      transition: transform .15s ease, background .2s ease;
    }
    #${ID_PREFIX}-close:hover { background: rgba(255,255,255,.28); transform: rotate(90deg); }

    /* Content */
    #${ID_PREFIX}-content { padding: 16px; }

    .${ID_PREFIX}-field { display: grid; gap: 6px; margin-bottom: 12px; }
    .${ID_PREFIX}-label { font-size: 13px; color: var(--cw-muted); }
    .${ID_PREFIX}-input {
      appearance: none; width: 100%; padding: 12px 12px; border-radius: 12px; border: 1px solid #e5e7eb;
      outline: none; font-size: 14px; transition: box-shadow .2s ease, border-color .2s ease;
      background: #fbfbfd;
    }
    .${ID_PREFIX}-input:focus { border-color: var(--cw-primary); box-shadow: 0 0 0 4px var(--cw-ring); background: #fff; }

    .${ID_PREFIX}-btn {
      width: 100%; padding: 12px 14px; border: none; border-radius: 12px; font-weight: 600;
      background: linear-gradient(135deg, var(--cw-primary), var(--cw-primary-2)); color: white;
      cursor: pointer; box-shadow: var(--cw-shadow);
      transition: transform .15s ease, filter .2s ease;
    }
    .${ID_PREFIX}-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
    .${ID_PREFIX}-btn:active { transform: translateY(0); }

    /* Helper: show */
    .${ID_PREFIX}-show #${ID_PREFIX}-popup {
      transform: translateY(0) scale(1);
      opacity: 1; pointer-events: auto;
    }
    .${ID_PREFIX}-show #${ID_PREFIX}-backdrop {
      opacity: 1; pointer-events: auto;
    }

    /* Small screens: lift popup higher */
    @media (max-width: 480px) {
      #${ID_PREFIX}-popup { bottom: 100px; }
    }
  `;
  document.head.appendChild(style);

  // 2) Create elements
  const fab = document.createElement("button");
  fab.id = `${ID_PREFIX}-fab`;
  fab.setAttribute("aria-label", "Open chat form");
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H12l-4.5 4V15H7.5A3.5 3.5 0 0 1 4 11.5v-6Z" stroke="currentColor" stroke-width="1.7"/>
    </svg>
  `;

  const backdrop = document.createElement("div");
  backdrop.id = `${ID_PREFIX}-backdrop`;

  const popup = document.createElement("div");
  popup.id = `${ID_PREFIX}-popup`;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-labelledby", `${ID_PREFIX}-title`);

  const header = document.createElement("div");
  header.id = `${ID_PREFIX}-header`;

  const title = document.createElement("div");
  title.id = `${ID_PREFIX}-title`;
  title.textContent = "Let’s chat!";

  const closeBtn = document.createElement("button");
  closeBtn.id = `${ID_PREFIX}-close`;
  closeBtn.setAttribute("aria-label", "Close chat form");
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  `;

  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = document.createElement("div");
  content.id = `${ID_PREFIX}-content`;

  const form = document.createElement("form");
  form.id = `${ID_PREFIX}-form`;
  form.setAttribute("novalidate", "");

  // Name field
  const nameField = document.createElement("div");
  nameField.className = `${ID_PREFIX}-field`;
  const nameLabel = document.createElement("label");
  nameLabel.className = `${ID_PREFIX}-label`;
  nameLabel.setAttribute("for", `${ID_PREFIX}-name`);
  nameLabel.textContent = "Name";
  const nameInput = document.createElement("input");
  nameInput.className = `${ID_PREFIX}-input`;
  nameInput.id = `${ID_PREFIX}-name`;
  nameInput.name = "name";
  nameInput.type = "text";
  nameInput.placeholder = "Your name";
  nameInput.required = true;
  nameInput.maxLength = 60;
  nameField.appendChild(nameLabel);
  nameField.appendChild(nameInput);

  // Mobile field
  const phoneField = document.createElement("div");
  phoneField.className = `${ID_PREFIX}-field`;
  const phoneLabel = document.createElement("label");
  phoneLabel.className = `${ID_PREFIX}-label`;
  phoneLabel.setAttribute("for", `${ID_PREFIX}-phone`);
  phoneLabel.textContent = "Mobile number";
  const phoneInput = document.createElement("input");
  phoneInput.className = `${ID_PREFIX}-input`;
  phoneInput.id = `${ID_PREFIX}-phone`;
  phoneInput.name = "phone";
  phoneInput.type = "tel";
  phoneInput.placeholder = "e.g. 017XXXXXXXX";
  phoneInput.required = true;
  phoneInput.pattern = "[0-9 +()-]{6,15}"; // basic lenient pattern
  phoneField.appendChild(phoneLabel);
  phoneField.appendChild(phoneInput);

  // Submit
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = `${ID_PREFIX}-btn`;
  submit.textContent = "Submit";

  form.appendChild(nameField);
  form.appendChild(phoneField);
  form.appendChild(submit);

  content.appendChild(form);

  popup.appendChild(header);
  popup.appendChild(content);

  document.body.appendChild(backdrop);
  document.body.appendChild(popup);
  document.body.appendChild(fab);

  // 3) Behavior
  const root = document.documentElement;
  function open() { root.classList.add(`${ID_PREFIX}-show`); nameInput.focus(); }
  function close() { root.classList.remove(`${ID_PREFIX}-show`); }

  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Simple validation
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      nameInput.focus();
      nameInput.reportValidity();
      return;
    }
    if (!phone || !phoneInput.checkValidity()) {
      phoneInput.focus();
      phoneInput.reportValidity();
      return;
    }

    alert(`Thanks!\nName: ${name}\nMobile: ${phone}`);
    // Reset form for next time
    form.reset();
    close();
  });
})();
