const vscode = require('vscode');

// Estado do modo foco
let currentDecoration = null;
let focusDecoration = null;
let wordHighlightDecoration = null;
let focusModeActive = false;
let activeLinesSet = new Set();
let selectionListener = null;
let cursorListener = null;

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
    
    // Atualizar configuração global
    const config = vscode.workspace.getConfiguration('NeuroCoder');
    config.update('focusModeOpacity', opacity, vscode.ConfigurationTarget.Global);

    // Se o modo foco estiver ativo, recriar as decorações com nova opacidade
    if (focusModeActive) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            console.log('🔄 Recriando decorações com nova opacidade:', opacity);
            recreateDecorationsWithOpacity(opacity);
            updateFocus(editor);
        }
    }
}

function recreateDecorationsWithOpacity(opacity) {
    // Limpar decorações antigas
    if (focusDecoration) {
        focusDecoration.dispose();
    }
    if (currentDecoration) {
        currentDecoration.dispose();
    }
    if (wordHighlightDecoration) {
        wordHighlightDecoration.dispose();
    }

    // Calcular a cor do texto baseado na opacidade
    const textBrightness = Math.max(0, 100 - (opacity * 100));
    const textColor = `rgba(255, 255, 255, ${textBrightness / 100})`;

    // Recriar decorações com nova opacidade
    currentDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'transparent',
        isWholeLine: true,
    });

    focusDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        color: textColor,
        isWholeLine: true,
    });

    // Decoração para highlight de palavras repetidas
    wordHighlightDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 215, 0, 0.3)', // Amarelo dourado suave
        border: '1px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '2px',
        isWholeLine: false,
    });

    console.log('✅ Decorações recriadas - Opacidade:', opacity, 'Cor do texto:', textColor);
}

function applyFocusMode(editor) {
    console.log('🔧 Aplicando modo foco no editor...');
    
    const config = vscode.workspace.getConfiguration("NeuroCoder");
    const opacity = config.get("focusModeOpacity", 0.7);
    
    console.log('📊 Opacidade configurada:', opacity);

    // Limpar decorações anteriores se existirem
    if (focusDecoration) {
        focusDecoration.dispose();
    }
    if (currentDecoration) {
        currentDecoration.dispose();
    }
    if (wordHighlightDecoration) {
        wordHighlightDecoration.dispose();
    }
    if (selectionListener) {
        selectionListener.dispose();
    }
    if (cursorListener) {
        cursorListener.dispose();
    }

    // Calcular a cor do texto baseado na opacidade
    const textBrightness = Math.max(0, 100 - (opacity * 100));
    const textColor = `rgba(255, 255, 255, ${textBrightness / 100})`;

    // Criar decorações
    currentDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'transparent',
        isWholeLine: true,
    });

    focusDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        color: textColor,
        isWholeLine: true,
    });

    // Decoração para highlight de palavras repetidas
    wordHighlightDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 215, 0, 0.3)', // Amarelo dourado suave
        border: '1px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '2px',
        isWholeLine: false,
    });

    console.log('✅ Decorações criadas - Fundo:', opacity, 'Texto:', textColor);

    // Limpar estado anterior
    activeLinesSet.clear();
    
    // Aplicar e configurar listeners
    updateFocus(editor);
    updateWordHighlight(editor);
    
    // Configurar listener para mudanças de seleção
    selectionListener = vscode.window.onDidChangeTextEditorSelection((event) => {
        if (event.textEditor === editor) {
            console.log('🖱️ Seleção alterada, atualizando foco...');
            updateFocus(editor);
        }
    });
    
    // Configurar listener para movimento do cursor (para highlight de palavras)
    cursorListener = vscode.window.onDidChangeTextEditorSelection((event) => {
        if (event.textEditor === editor && event.selections.length > 0) {
            const selection = event.selections[0];
            if (selection.isEmpty) {
                console.log('👆 Cursor movido, atualizando highlight de palavras...');
                updateWordHighlight(editor);
            }
        }
    });
    
    console.log('✅ Listeners configurados');
}

function updateFocus(editor) {
    if (!focusModeActive) {
        console.log('ℹ️ Modo foco não está ativo, ignorando atualização');
        return;
    }

    console.log('🔄 Atualizando foco...');
    const document = editor.document;
    const selections = editor.selections;

    // Encontrar todas as linhas que estão selecionadas
    const selectedLines = new Set();
    selections.forEach(selection => {
        for (let line = selection.start.line; line <= selection.end.line; line++) {
            selectedLines.add(line);
        }
    });

    console.log(`📊 Linhas selecionadas: ${Array.from(selectedLines).join(', ')}`);

    // Criar ranges para todas as linhas NÃO selecionadas
    const focusRanges = [];
    const highlightRanges = [];
    
    for (let line = 0; line < document.lineCount; line++) {
        const lineText = document.lineAt(line);
        const range = new vscode.Range(line, 0, line, lineText.text.length);
        
        if (!selectedLines.has(line)) {
            focusRanges.push(range);
        } else {
            highlightRanges.push(range);
        }
    }
    
    // Aplicar as decorações
    editor.setDecorations(focusDecoration, focusRanges);
    editor.setDecorations(currentDecoration, highlightRanges);
    
    console.log(`🎯 ${focusRanges.length} linhas escurecidas`);
    console.log(`💡 ${highlightRanges.length} linhas destacadas`);
}

function updateWordHighlight(editor) {
    if (!focusModeActive || !wordHighlightDecoration) {
        return;
    }

    const document = editor.document;
    const selection = editor.selection;

    // Só processar se for uma seleção vazia (apenas cursor)
    if (!selection.isEmpty) {
        editor.setDecorations(wordHighlightDecoration, []);
        return;
    }

    // Obter a palavra sob o cursor
    const wordRange = document.getWordRangeAtPosition(selection.active);
    if (!wordRange) {
        editor.setDecorations(wordHighlightDecoration, []);
        return;
    }

    const word = document.getText(wordRange);
    
    // Ignorar palavras muito curtas ou números
    if (word.length < 2 || /^\d+$/.test(word)) {
        editor.setDecorations(wordHighlightDecoration, []);
        return;
    }

    console.log(`🔍 Procurando ocorrências da palavra: "${word}"`);

    // Encontrar todas as ocorrências da palavra no documento
    const wordRanges = [];
    const text = document.getText();
    const lines = text.split('\n');

    let currentPosition = 0;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        const words = line.split(/\W+/); // Dividir por caracteres não-alfanuméricos
        
        let wordStart = 0;
        for (const currentWord of words) {
            if (currentWord === word) {
                // Encontrar a posição exata da palavra na linha
                const wordPos = line.indexOf(currentWord, wordStart);
                if (wordPos !== -1) {
                    const startPos = new vscode.Position(lineIndex, wordPos);
                    const endPos = new vscode.Position(lineIndex, wordPos + word.length);
                    const range = new vscode.Range(startPos, endPos);
                    
                    // Não incluir a palavra onde o cursor está atualmente
                    if (!range.contains(selection.active)) {
                        wordRanges.push(range);
                    }
                    
                    wordStart = wordPos + word.length;
                }
            } else if (currentWord) {
                wordStart = line.indexOf(currentWord, wordStart) + currentWord.length;
            }
        }
    }

    // Aplicar o highlight nas palavras encontradas
    editor.setDecorations(wordHighlightDecoration, wordRanges);
    console.log(`✨ ${wordRanges.length} ocorrências da palavra "${word}" destacadas`);
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
    
    if (wordHighlightDecoration) {
        wordHighlightDecoration.dispose();
        wordHighlightDecoration = null;
        console.log('✅ Decoração de highlight removida');
    }
    
    if (selectionListener) {
        selectionListener.dispose();
        selectionListener = null;
        console.log('✅ Listener de seleção removido');
    }
    
    if (cursorListener) {
        cursorListener.dispose();
        cursorListener = null;
        console.log('✅ Listener de cursor removido');
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