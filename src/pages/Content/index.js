import { injectHeaderProductTable } from './modules/parseProductsTable';

console.log('CONTENT SCRIPT RUNNING');

// Create the fixed icon
const icon = document.createElement('div');
icon.id = 'extension-icon';
icon.style.position = 'fixed';
icon.style.bottom = '20px';
icon.style.right = '20px';
icon.style.width = '50px';
icon.style.height = '50px';
icon.style.background = 'blue';
icon.style.cursor = 'pointer';
document.body.appendChild(icon);

// Create the side panel (initially hidden)
const panel = document.createElement('iframe');
panel.id = 'extension-panel';
panel.src = chrome.runtime.getURL('popup.html');
panel.style.position = 'fixed';
panel.style.top = '0';
panel.style.right = '0';
panel.style.width = '300px';
panel.style.height = '100vh';
panel.style.border = 'none';
panel.style.display = 'none';
document.body.appendChild(panel);

// Toggle panel visibility on icon click
icon.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});