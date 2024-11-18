console.log('CONTENT SCRIPT RUNNING');

// Create the fixed icon
const icon = document.createElement('img');
icon.src = "https://i.postimg.cc/6qQbPbpV/i-TWO-icon.webp";
icon.id = 'extension-icon';
icon.style.position = 'relative';
icon.style.top = '20px';
icon.style.left = '-80px';
icon.style.width = '100px';
icon.style.height = 'auto';
icon.style.cursor = 'pointer';

// Create the side panel (initially hidden)
const panel = document.createElement('iframe');
panel.id = 'extension-panel';
panel.src = chrome.runtime.getURL('popup.html');
panel.style.position = 'absolute';
panel.style.top = '0';
panel.style.right = '0';
panel.style.bottom = '0';
panel.style.left = '0';
panel.style.width = '500px';
panel.style.height = '100vh';
panel.style.border = 'none';
panel.style.visibility = 'hidden';
panel.style.zIndex = '9999';

// Create a shadow root and attach it to the body
const extensionContainer = document.createElement('div');
extensionContainer.id = 'extension-container';
extensionContainer.style.position = 'fixed';
extensionContainer.style.top = '0';
extensionContainer.style.right = '-500px';
extensionContainer.style.bottom = '0';
extensionContainer.style.height = '100vh';
extensionContainer.style.width = '500px';
extensionContainer.style.zIndex = '9999';
extensionContainer.style.transition = 'right 0.3s ease-in-out';

const shadow = extensionContainer.attachShadow({ mode: 'open' });
document.body.appendChild(extensionContainer);

// Add icon and panel to the shadow DOM
shadow.appendChild(icon);
shadow.appendChild(panel);

// Use visibility and pointer-events for toggling
icon.addEventListener('click', () => {
    if (panel.style.visibility === 'hidden') {
        extensionContainer.style.right = '0';
        panel.style.visibility = 'visible';
        panel.style.pointerEvents = 'auto';
    } else {
        extensionContainer.style.right = '-500px';
        // delay 0.3s to allow the animation to finish
        setTimeout(() => {
            panel.style.visibility = 'hidden';
            panel.style.pointerEvents = 'none';
        }, 300);
    }
});