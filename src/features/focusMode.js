const vscode = require('vscode');

// Estado do modo foco
let currentDecoration = null;
let focusDecoration = null;
let focusModeActive = false;
let activeLinesSet = new Set();

function isFocusModeActive() {
    return focusModeActive;
}

function activateFocusMode(settingsPanel = null) {
    console.log('🎯 activateFocusMode chamada');
    
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log('❌ Nenhum editor ativo');
        vscode.window.showWarningMessage('Nenhum editor ativo encontrado.');
        return;
    }

    if (!focusModeActive) {
        console.log('✅ Ativando modo foco...');
        applyFocusMode(editor);
        focusModeActive = true;
        
        updateWebviewFocusMode(settingsPanel, true);
        vscode.window.showInformationMessage('🎯 Modo Foco ativado!');
    } else {
        console.log('ℹ️ Modo foco já está ativo');
    }
}

function deactivateFocusMode(settingsPanel = null) {
    console.log('🚫 deactivateFocusMode chamada');
    
    if (focusModeActive) {
        console.log('✅ Desativando modo foco...');
        clearFocusMode();
        focusModeActive = false;
        
        updateWebviewFocusMode(settingsPanel, false);
        vscode.window.showInformationMessage('🚫 Modo Foco desativado!');
    } else {
        console.log('ℹ️ Modo foco já está desativado');
    }
}

function toggleFocusMode(settingsPanel = null) {
    console.log('🔁 toggleFocusMode chamada');
    if (focusModeActive) {
        deactivateFocusMode(settingsPanel);
    } else {
        activateFocusMode(settingsPanel);
    }
}

function updateWebviewFocusMode(settingsPanel, active) {
    console.log('📊 Atualizando webview - modo foco:', active);
    
    if (settingsPanel && settingsPanel.webview) {
        try {
            settingsPanel.webview.postMessage({
                command: 'updateFocusMode',
                active: active
            }).then(() => {
                console.log('✅ Mensagem enviada para webview com sucesso');
            }).catch(error => {
                console.error('❌ Erro ao enviar mensagem para webview:', error);
            });
        } catch (error) {
            console.error('❌ Erro ao acessar webview:', error);
        }
    } else {
        console.log('ℹ️ Webview não disponível para atualização');
    }
}

// Adicione esta função para forçar a sincronização inicial
function syncFocusModeState(settingsPanel) {
    if (settingsPanel) {
        updateWebviewFocusMode(settingsPanel, focusModeActive);
    }
}

function updateFocusOpacity(opacity) {
    console.log('🎚️ Atualizando opacidade para:', opacity);
    
    if (!focusDecoration) {
        console.log('ℹ️ Nenhuma decoração de foco ativa');
        return;
    }

    focusDecoration.dispose();

    // Atualizar configuração global
    const config = vscode.workspace.getConfiguration('NeuroCoder');
    config.update('focusModeOpacity', opacity, vscode.ConfigurationTarget.Global);

    // Recriar decoração com nova opacidade
    focusDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        color: 'black',
        isWholeLine: true,
    });

    console.log('✅ Decoração de foco atualizada');

    // Reaplicar se o modo foco estiver ativo
    const editor = vscode.window.activeTextEditor;
    if (editor && focusModeActive) {
        console.log('🔄 Reaplicando modo foco com nova opacidade');
        updateFocus(editor);
    }
}

function applyFocusMode(editor) {
    console.log('🔧 Aplicando modo foco no editor...');
    
    const config = vscode.workspace.getConfiguration("NeuroCoder");
    const opacity = config.get("focusModeOpacity", 0.7);
    
    console.log('📊 Opacidade configurada:', opacity);

    // Criar decorações
    currentDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'transparent',
        isWholeLine: true,
    });

    focusDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        color: 'black',
        isWholeLine: true,
    });

    console.log('✅ Decorações criadas');

    // Limpar estado anterior
    activeLinesSet.clear();
    
    // Aplicar e configurar listener
    updateFocus(editor);
    
    // Configurar listener para mudanças de seleção
    const disposable = vscode.window.onDidChangeTextEditorSelection(() => {
        console.log('🖱️ Seleção alterada, atualizando foco...');
        updateFocus(editor);
    });
    
    console.log('✅ Listener de seleção configurado');
}

function updateFocus(editor) {
    if (!focusModeActive) {
        console.log('ℹ️ Modo foco não está ativo, ignorando atualização');
        return;
    }

    console.log('🔄 Atualizando foco...');
    const totalLines = editor.document.lineCount;
    const selections = editor.selections;

    // Limpar e recalcular linhas ativas
    activeLinesSet.clear();
    for (const sel of selections) {
        for (let i = sel.start.line; i <= sel.end.line; i++) {
            activeLinesSet.add(i);
        }
    }

    console.log(`📊 Linhas ativas: ${Array.from(activeLinesSet).join(', ')}`);

    // Aplicar decoração nas linhas não ativas
    const focusDecorations = [];
    for (let i = 0; i < totalLines; i++) {
        if (!activeLinesSet.has(i)) {
            focusDecorations.push(new vscode.Range(i, 0, i, editor.document.lineAt(i).text.length));
        }
    }
    
    editor.setDecorations(focusDecoration, focusDecorations);
    console.log(`🎯 ${focusDecorations.length} linhas escurecidas`);

    // Destacar linhas ativas
    const highlightDecorations = [];
    for (let line of activeLinesSet) {
        highlightDecorations.push(new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length));
    }
    
    editor.setDecorations(currentDecoration, highlightDecorations);
    console.log(`💡 ${highlightDecorations.length} linhas destacadas`);
}

function clearFocusMode() {
    console.log('🧹 Limpando modo foco...');
    
    if (focusDecoration) {
        focusDecoration.dispose();
        focusDecoration = null;
        console.log('✅ Decoração de foco removida');
    }
    
    if (currentDecoration) {
        currentDecoration.dispose();
        currentDecoration = null;
        console.log('✅ Decoração atual removida');
    }
    
    activeLinesSet.clear();
    focusModeActive = false;
    console.log('✅ Estado do modo foco limpo');
}

module.exports = {
    activateFocusMode,
    deactivateFocusMode,
    updateFocusOpacity,
    toggleFocusMode,
    clearFocusMode,
    isFocusModeActive,
    syncFocusModeState
};