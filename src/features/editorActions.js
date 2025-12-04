const vscode = require('vscode');

let currentDecorations = [];
let originalTheme = null; // Armazenar o tema original

function saveSettings(font, fontSize, color, letterSpacing, lineHeight, dyslexicMode = false, focusOpacity = 0.7) {
    const configuration = vscode.workspace.getConfiguration('editor');
  
    console.log('💾 Salvando configurações:', { font, fontSize, color, letterSpacing, lineHeight, dyslexicMode, focusOpacity });

    // Verificar fonte antes de aplicar
    checkFontAvailability(font);
  
    // Aplicar configurações de fonte
    applyFontSettings(font, configuration);
  
    // Aplicar outras configurações visuais
    applyVisualSettings(fontSize, letterSpacing, lineHeight, configuration);
  
    // Aplicar configurações de cor
    applyColorSettings(color);
  
    // Salvar configurações específicas do NeuroCoder
    saveNeuroCoderSettings(dyslexicMode, focusOpacity);
}

function checkFontAvailability(font) {
    if (font === "OpenDyslexic") {
        vscode.window.showWarningMessage(
            "A fonte OpenDyslexic pode não estar instalada no seu sistema. " +
            "Caso não funcione, baixe e instale pelo site: https://opendyslexic.org/"
        );
    }
}

function applyFontSettings(font, configuration) {
    if (font === "OpenDyslexic") {
        configuration.update('fontFamily', "'OpenDyslexic', sans-serif", vscode.ConfigurationTarget.Global);
    } else {
        configuration.update('fontFamily', font, vscode.ConfigurationTarget.Global);
    }
}

function applyVisualSettings(fontSize, letterSpacing, lineHeight, configuration) {
    configuration.update('fontSize', parseInt(fontSize), vscode.ConfigurationTarget.Global);
    configuration.update('letterSpacing', parseFloat(letterSpacing), vscode.ConfigurationTarget.Global);
    configuration.update('lineHeight', parseFloat(lineHeight), vscode.ConfigurationTarget.Global);
}

function applyColorSettings(color) {
    const userSettings = vscode.workspace.getConfiguration('workbench');
    const editorColorSettings = {
        "colorCustomizations": {
            "editor.foreground": color
        }
    };
    userSettings.update('colorCustomizations', editorColorSettings.colorCustomizations, vscode.ConfigurationTarget.Global);
}

function saveNeuroCoderSettings(dyslexicMode, focusOpacity) {
    const neuroCoderConfig = vscode.workspace.getConfiguration('NeuroCoder');
    neuroCoderConfig.update('dyslexicMode', dyslexicMode, vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('focusModeOpacity', focusOpacity, vscode.ConfigurationTarget.Global);
}

function markText(color = '#ffff00') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("Nenhum editor ativo encontrado.");
        return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showInformationMessage("Por favor, selecione um trecho de código para marcar.");
        return;
    }

    const decorationType = createMarkingDecoration(color);
    editor.setDecorations(decorationType, [selection]);
    currentDecorations.push(decorationType);

    vscode.window.showInformationMessage("✅ Texto marcado com sucesso.");
}

function clearMarking() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        currentDecorations.forEach(decoration => {
            editor.setDecorations(decoration, []);
            decoration.dispose();
        });
        currentDecorations = [];
        vscode.window.showInformationMessage("🗑️ Todas as marcações foram removidas.");
    }
}

function createMarkingDecoration(color) {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        isWholeLine: false,
    });
}

function restoreDefaultSettings(panel) {
    console.log('🔄 Iniciando restauração das configurações padrão...');
    
    // Salvar o tema atual ANTES de restaurar
    saveCurrentTheme();
    
    const configuration = vscode.workspace.getConfiguration('editor');
    const userSettings = vscode.workspace.getConfiguration('workbench');

    // Restaurar configurações do editor
    restoreEditorSettings(configuration);
    
    // Restaurar configurações de cor
    restoreColorSettings(userSettings);

    // Restaurar o tema original
    restoreOriginalTheme();

    // Restaurar configurações do NeuroCoder
    restoreNeuroCoderSettings();

    // Notificar usuário
    vscode.window.showInformationMessage("🔄 Configurações restauradas para os valores padrão.");

    // Atualizar webview se disponível
    if (panel) {
        panel.webview.postMessage({
            command: 'restoreDefaults',
            settings: getDefaultSettings()
        });
    }
}

function saveCurrentTheme() {
    const config = vscode.workspace.getConfiguration();
    originalTheme = config.get('workbench.colorTheme');
    console.log('🎨 Tema atual salvo:', originalTheme);
}

function restoreOriginalTheme() {
    if (originalTheme) {
        console.log('🎨 Restaurando tema original:', originalTheme);
        vscode.commands.executeCommand('workbench.action.selectTheme', originalTheme)
            .then(() => {
                console.log('✅ Tema original restaurado com sucesso');
            })
            .catch(error => {
                console.error('❌ Erro ao restaurar tema original:', error);
                // Fallback para tema padrão
                restoreDefaultTheme();
            });
    } else {
        console.log('ℹ️ Nenhum tema original salvo, restaurando tema padrão');
        restoreDefaultTheme();
    }
}

function restoreDefaultTheme() {
    // Tema padrão do VS Code
    const defaultThemes = [
        'Default Dark Modern',
        'Default Light Modern', 
        'Default Dark+',
        'Default Light+',
        'Visual Studio Dark',
        'Visual Studio Light'
    ];

    // Tentar restaurar para um tema padrão
    vscode.commands.executeCommand('workbench.action.selectTheme', defaultThemes[0])
        .then(() => {
            console.log('✅ Tema padrão restaurado');
        })
        .catch(error => {
            console.error('❌ Erro ao restaurar tema padrão:', error);
        });
}

function restoreEditorSettings(configuration) {
    console.log('📝 Restaurando configurações do editor...');
    
    // Restaurar para valores padrão do VS Code
    configuration.update('fontFamily', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('fontSize', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('letterSpacing', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('lineHeight', undefined, vscode.ConfigurationTarget.Global);
    
    console.log('✅ Configurações do editor restauradas');
}

function restoreColorSettings(userSettings) {
    console.log('🎨 Restaurando configurações de cor...');
    
    userSettings.update('colorCustomizations', undefined, vscode.ConfigurationTarget.Global);
    
    console.log('✅ Configurações de cor restauradas');
}

function restoreNeuroCoderSettings() {
    console.log('🧠 Restaurando configurações do NeuroCoder...');
    
    const neuroCoderConfig = vscode.workspace.getConfiguration('NeuroCoder');
    
    // Restaurar para valores padrão
    neuroCoderConfig.update('dyslexicMode', false, vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('focusModeOpacity', 0.7, vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('font', 'Lexend', vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('fontSize', 14, vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('color', '#000000', vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('letterSpacing', 0, vscode.ConfigurationTarget.Global);
    neuroCoderConfig.update('lineHeight', 1.5, vscode.ConfigurationTarget.Global);
    
    console.log('✅ Configurações do NeuroCoder restauradas');
}

function getDefaultSettings() {
    return {
        font: 'Lexend',
        fontSize: 14,
        color: '#000000',
        letterSpacing: 0,
        lineHeight: 1.5,
        focusOpacity: 0.7,
        dyslexicMode: false
    };
}

// Inicializar: detectar o tema atual quando a extensão é carregada
function initializeThemeDetection() {
    const config = vscode.workspace.getConfiguration();
    originalTheme = config.get('workbench.colorTheme');
    console.log('🎨 Tema inicial detectado:', originalTheme);
}

module.exports = { 
    saveSettings, 
    markText, 
    clearMarking, 
    restoreDefaultSettings,
    initializeThemeDetection
};