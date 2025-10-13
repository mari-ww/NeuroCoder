const vscode = require('vscode');
const path = require('path');

// Imports organizados
const { getWebviewContent } = require('./webview/webviewContent');
const { saveSettings, restoreDefaultSettings, markText, clearMarking } = require('./features/editorActions');
const { 
    activateFocusMode, 
    deactivateFocusMode, 
    updateFocusOpacity, 
    toggleFocusMode, 
    clearFocusMode,
    isFocusModeActive 
} = require('./features/focusMode');

// Estado global
let settingsPanel = null;
let currentTheme = vscode.window.activeColorTheme.kind;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('🔧 NeuroCoder extension is now active!');

    // Configurar listeners de tema
    setupThemeListener();

    // Registrar comandos
    registerCommands(context);

    // Verificar comandos registrados (debug)
    debugCommands();
}

function setupThemeListener() {
    vscode.window.onDidChangeActiveColorTheme(theme => {
        currentTheme = theme.kind;
        if (settingsPanel) {
            settingsPanel.webview.postMessage({
                command: 'setTheme',
                theme: currentTheme
            });
        }
    });
}

function registerCommands(context) {
    const commands = [
        // Comandos do Modo Foco
        { command: "NeuroCoder.activateFocusMode", callback: () => activateFocusMode(settingsPanel) },
        { command: "NeuroCoder.deactivateFocusMode", callback: () => deactivateFocusMode(settingsPanel) },
        { command: "NeuroCoder.toggleFocusMode", callback: () => toggleFocusMode(settingsPanel) },
        
        // Comandos de Configurações
        { command: 'NeuroCoder.showSettingsPanel', callback: () => showSettingsPanel(context) },
        { command: 'NeuroCoder.openSettings', callback: () => showSettingsPanel(context) }, 
    ];

    commands.forEach(({ command, callback }) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(command, callback)
        );
    });
}

function debugCommands() {
    const commands = vscode.commands.getCommands();
    commands.then(cmdList => {
        const neuroCommands = cmdList.filter(cmd => cmd.includes('NeuroCoder'));
        console.log('Comandos NeuroCoder registrados:', neuroCommands);
    });
}

function showSettingsPanel(context) {
    console.log('Comando NeuroCoder.showSettingsPanel executado');
    
    if (settingsPanel) {
        settingsPanel.reveal(vscode.ViewColumn.Two);
        return;
    }

    // Criar painel de configurações
    createSettingsPanel(context);
}

function createSettingsPanel(context) {
    settingsPanel = vscode.window.createWebviewPanel(
        'neuroCoderSettings',
        'NeuroCoder - Configurações',
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media', 'sounds'))
            ]
        }
    );

    // Configurar conteúdo do webview
    setupWebviewContent(context);

    // Configurar mensagens do webview
    setupWebviewMessageListener(context);

    // Limpar ao fechar
    settingsPanel.onDidDispose(() => {
        settingsPanel = null;
    });
}

function setupWebviewContent(context) {
    const beepSoundPath = path.join(context.extensionPath, 'media', 'sounds', 'beep.mp3');
    const beepSoundUri = settingsPanel.webview.asWebviewUri(vscode.Uri.file(beepSoundPath));

    const config = vscode.workspace.getConfiguration('NeuroCoder');
    const savedSettings = {
        font: config.get('font', 'Lexend'),
        fontSize: config.get('fontSize', 18),
        color: config.get('color', '#000000'),
        letterSpacing: config.get('letterSpacing', 0),
        lineHeight: config.get('lineHeight', 1.5),
        focusOpacity: config.get('focusModeOpacity', 0.7),
        dyslexicMode: config.get('dyslexicMode', false)
    };

    settingsPanel.webview.html = getWebviewContent(
        savedSettings, 
        isFocusModeActive(), 
        beepSoundUri.toString()
    );

    // Enviar tema atual
    settingsPanel.webview.postMessage({ 
        command: "setTheme", 
        theme: currentTheme 
    });

    // Sincronizar estado do modo foco após o webview carregar
    setTimeout(() => {
        const { syncFocusModeState } = require('./features/focusMode');
        syncFocusModeState(settingsPanel);
    }, 1000);
}

function setupWebviewMessageListener(context) {
    settingsPanel.webview.onDidReceiveMessage(
        (message) => {
            handleWebviewMessage(message, context);
        },
        undefined,
        context.subscriptions
    );
}

function handleWebviewMessage(message, context) {
    const messageHandlers = {
        'saveSettings': () => {
            saveSettings(
                message.font, 
                message.fontSize, 
                message.color, 
                message.letterSpacing, 
                message.lineHeight,
                message.dyslexicMode,
                message.focusOpacity
            );
            vscode.window.showInformationMessage(
                `Configurações salvas: Fonte - ${message.font}, Tamanho - ${message.fontSize}`
            );
        },
        'restoreDefaults': () => restoreDefaultSettings(settingsPanel),
        'markText': () => markText(message.highlightColor || '#ffff00'),
        'clearMarking': () => clearMarking(),
        'updateFocusOpacity': () => updateFocusOpacity(message.focusOpacity),
        'activateFocusMode': () => {
            console.log('📱 Comando activateFocusMode recebido do webview');
            activateFocusMode(settingsPanel);
        },
        'deactivateFocusMode': () => {
            console.log('📱 Comando deactivateFocusMode recebido do webview');
            deactivateFocusMode(settingsPanel);
        },
        'showInformationMessage': () => {
            vscode.window.showInformationMessage(message.text);
        }
    };

    if (messageHandlers[message.command]) {
        console.log(`🔄 Executando comando: ${message.command}`);
        messageHandlers[message.command]();
    } else {
        console.warn(`⚠️ Comando não reconhecido: ${message.command}`);
    }
}

function deactivate() {
    clearFocusMode();
    console.log('NeuroCoder extension deactivated');
}

module.exports = {
    activate,
    deactivate
};