const vscode = require('vscode');
const path = require('path');

// Imports organizados
const { getWebviewContent } = require('./webview/webviewContent');
const { saveSettings, restoreDefaultSettings, markText, clearMarking, initializeThemeDetection } = require('./features/editorActions');
const { 
    activateFocusMode, 
    deactivateFocusMode, 
    updateFocusOpacity, 
    toggleFocusMode, 
    clearFocusMode,
    isFocusModeActive,
    syncFocusModeState
} = require('./features/focusMode');

// Estado global
let settingsPanel = null;
let currentTheme = vscode.window.activeColorTheme.kind;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('🔧 NeuroCoder extension is now active!');
    
    // Inicializar detecção de tema
    initializeThemeDetection();

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
            ],
            retainContextWhenHidden: true
        }
    );

    // Configurar conteúdo do webview
    setupWebviewContent(context);

    // Configurar mensagens do webview
    setupWebviewMessageListener(context);

    // Sincronizar estado do modo foco imediatamente
    syncFocusModeState(settingsPanel);

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
    console.log('📱 Mensagem recebida do webview:', message.command);
    
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
            console.log('🎯 Comando activateFocusMode recebido do webview');
            activateFocusMode(settingsPanel);
        },
        'deactivateFocusMode': () => {
            console.log('🚫 Comando deactivateFocusMode recebido do webview');
            deactivateFocusMode(settingsPanel);
        },
        'showColorBlindThemes': () => {
            showColorBlindThemesQuickPick();
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

function showColorBlindThemesQuickPick() {
    // Lista de temas funcionais do VS Code com descrições
    const themes = [
        { 
            label: 'Default Dark Modern', 
            description: 'Tema escuro moderno (Padrão VS Code)',
            detail: 'Bom contraste para todos os tipos de visão'
        },
        { 
            label: 'Default Light Modern', 
            description: 'Tema claro moderno (Padrão VS Code)',
            detail: 'Bom contraste para todos os tipos de visão'
        },
        { 
            label: 'Visual Studio Dark', 
            description: 'Tema escuro clássico',
            detail: 'Contraste tradicional do Visual Studio'
        },
        { 
            label: 'Visual Studio Light', 
            description: 'Tema claro clássico', 
            detail: 'Contraste tradicional do Visual Studio'
        },
        { 
            label: 'Red', 
            description: 'Tema com ênfase em vermelho',
            detail: 'Pode ajudar com Tritanopia (dificuldade com azul/amarelo)'
        },
        { 
            label: 'Blue', 
            description: 'Tema com ênfase em azul',
            detail: 'Pode ajudar com Protanopia/Deuteranopia (vermelho/verde)'
        },
        { 
            label: 'Monokai', 
            description: 'Tema Monokai',
            detail: 'Alto contraste, popular entre desenvolvedores'
        },
        { 
            label: 'Solarized Dark', 
            description: 'Tema Solarized Escuro',
            detail: 'Cores suaves e balanceadas'
        },
        { 
            label: 'Solarized Light', 
            description: 'Tema Solarized Claro',
            detail: 'Cores suaves e balanceadas'
        },
        { 
            label: 'High Contrast', 
            description: 'Alto Contraste',
            detail: 'Máximo contraste para baixa visão'
        },
        { 
            label: 'High Contrast Light', 
            description: 'Alto Contraste Claro',
            detail: 'Máximo contraste claro para baixa visão'
        }
    ];

    vscode.window.showQuickPick(themes, {
        placeHolder: 'Selecione um tema acessível para daltonismo',
        matchOnDescription: true,
        matchOnDetail: true
    }).then(selectedTheme => {
        if (selectedTheme) {
            console.log(`🎨 Aplicando tema: ${selectedTheme.label}`);
            
            vscode.commands.executeCommand('workbench.action.selectTheme', selectedTheme.label)
                .then(() => {
                    vscode.window.showInformationMessage(`✅ Tema "${selectedTheme.label}" aplicado!`);
                })
                .catch(error => {
                    console.error('❌ Erro ao aplicar tema:', error);
                    vscode.window.showErrorMessage(`❌ Não foi possível aplicar o tema "${selectedTheme.label}". Tente selecionar manualmente.`);
                });
        }
    });
}

function deactivate() {
    clearFocusMode();
    console.log('NeuroCoder extension deactivated');
}

module.exports = {
    activate,
    deactivate
};