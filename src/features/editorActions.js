const vscode = require('vscode');

let currentDecorations = [];

function saveSettings(font, fontSize, color, letterSpacing, lineHeight, dyslexicMode = false, focusOpacity = 0.7) {
    const configuration = vscode.workspace.getConfiguration('editor');
  
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
    const configuration = vscode.workspace.getConfiguration('editor');
    const userSettings = vscode.workspace.getConfiguration('workbench');

    // Restaurar configurações do editor
    restoreEditorSettings(configuration);
    
    // Restaurar configurações de cor
    restoreColorSettings(userSettings);

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

function restoreEditorSettings(configuration) {
    configuration.update('fontFamily', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('fontSize', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('letterSpacing', undefined, vscode.ConfigurationTarget.Global);
    configuration.update('lineHeight', undefined, vscode.ConfigurationTarget.Global);
}

function restoreColorSettings(userSettings) {
    userSettings.update('colorCustomizations', undefined, vscode.ConfigurationTarget.Global);
}

function getDefaultSettings() {
    return {
        font: undefined,
        fontSize: undefined,
        color: undefined,
        letterSpacing: undefined,
        lineHeight: undefined
    };
}

module.exports = { 
    saveSettings, 
    markText, 
    clearMarking, 
    restoreDefaultSettings 
};