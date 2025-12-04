const vscode = require('vscode');
const path = require('path');

// Imports organizados
const { getWebviewContent } = require('./webview/webviewContent');
const { 
    saveSettings, 
    restoreDefaultSettings, 
    markText, 
    clearMarking, 
    initializeThemeDetection,
    applyColorBlindTheme
} = require('./features/editorActions');
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
    
    initializeThemeDetection();
    setupThemeListener();
    registerCommands(context);
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
        { command: "NeuroCoder.activateFocusMode", callback: () => activateFocusMode(settingsPanel) },
        { command: "NeuroCoder.deactivateFocusMode", callback: () => deactivateFocusMode(settingsPanel) },
        { command: "NeuroCoder.toggleFocusMode", callback: () => toggleFocusMode(settingsPanel) },
        { command: 'NeuroCoder.showSettingsPanel', callback: () => showSettingsPanel(context) },
        { command: 'NeuroCoder.showColorBlindThemes', callback: () => showColorBlindThemesQuickPick() }
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

    setupWebviewContent(context);
    setupWebviewMessageListener(context);

    syncFocusModeState(settingsPanel);

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
        [],
        savedSettings,
        isFocusModeActive(),
        beepSoundUri.toString()
    );

    settingsPanel.webview.postMessage({ 
        command: "setTheme", 
        theme: currentTheme 
    });
}

function setupWebviewMessageListener(context) {
    settingsPanel.webview.onDidReceiveMessage(
        (message) => handleWebviewMessage(message, context),
        undefined,
        context.subscriptions
    );
}

function handleWebviewMessage(message, context) {
    console.log('📱 Mensagem recebida do webview:', message.command);
    
    const handlers = {
        saveSettings: () => {
            saveSettings(
                message.font, 
                message.fontSize, 
                message.color, 
                message.letterSpacing, 
                message.lineHeight,
                message.dyslexicMode,
                message.focusOpacity
            );
            vscode.window.showInformationMessage(`Configurações salvas.`);
        },
        restoreDefaults: () => restoreDefaultSettings(settingsPanel),
        markText: () => markText(message.highlightColor || '#1C3F92'),
        clearMarking: () => clearMarking(),
        updateFocusOpacity: () => updateFocusOpacity(message.focusOpacity),
        activateFocusMode: () => activateFocusMode(settingsPanel),
        deactivateFocusMode: () => deactivateFocusMode(settingsPanel),
        showColorBlindThemes: () => showColorBlindThemesQuickPick(),

        applyColorBlindTheme: async () => {
            console.log('🎨 Aplicando tema para daltonismo:', message.mode);
            await applyColorBlindTheme(message.mode);
        },

        showInformationMessage: () => vscode.window.showInformationMessage(message.text)
    };

    if (handlers[message.command]) {
        handlers[message.command]();
    }
}

async function showColorBlindThemesQuickPick() {

    const themes = [
        { 
            label: "Deuteranopia (Dark) — Modus Vivendi Deuteranopia",
            description: "Tema escuro otimizado para deuteranopia",
            id: "deuteranopia"
        },
        { 
            label: "Deuteranopia (Light) — Modus Operandi Deuteranopia",
            description: "Tema claro otimizado para deuteranopia",
            id: "deuteranopia-light"
        },
        { 
            label: "Tritanopia (Dark) — Modus Vivendi Tritanopia",
            description: "Tema escuro otimizado para tritanopia",
            id: "tritanopia"
        },
        { 
            label: "Tritanopia (Light) — Modus Operandi Tritanopia",
            description: "Tema claro otimizado para tritanopia",
            id: "tritanopia-light"
        },
        {
            label: "Nenhum (tema padrão)",
            description: "Remove o tema acessível e volta ao padrão",
            id: "none"
        }
    ];

    const choice = await vscode.window.showQuickPick(themes, {
        placeHolder: "Selecione um tema acessível"
    });

    if (!choice) return;

    await applyColorBlindTheme(choice.id);
}

const themeMap = {
    "deuteranopia": {
        theme: "Modus Vivendi Deuteranopia",
        extension: "wroyca.modus"
    },
    "deuteranopia-light": {
        theme: "Modus Operandi Deuteranopia",
        extension: "wroyca.modus"
    },
    "tritanopia": {
        theme: "Modus Vivendi Tritanopia",
        extension: "wroyca.modus"
    },
    "tritanopia-light": {
        theme: "Modus Operandi Tritanopia",
        extension: "wroyca.modus"
    },
    "none": {
        theme: "Default Dark Modern",
        extension: null
    }
};

async function applyColorBlindThemeLocal(mode) {
    const entry = themeMap[mode];
    if (!entry) {
        vscode.window.showErrorMessage(`Tema para daltonismo não encontrado: ${mode}`);
        return;
    }

    const { theme, extension } = entry;

    try {
        if (extension) {
            const isInstalled = vscode.extensions.getExtension(extension);

            if (!isInstalled) {
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Instalando extensão necessária para o tema...`,
                    cancellable: false
                }, async () => {
                    await vscode.commands.executeCommand(
                        "workbench.extensions.installExtension",
                        extension
                    );
                });
                vscode.window.showInformationMessage(`Extensão instalada: ${extension}`);
            }
        }

        await vscode.workspace.getConfiguration().update(
            "workbench.colorTheme",
            theme,
            vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(`Tema aplicado: ${theme}`);
        
    } catch (error) {
        vscode.window.showErrorMessage(`Erro ao aplicar tema de daltonismo: ${error.message}`);
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