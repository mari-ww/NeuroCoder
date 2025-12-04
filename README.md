# <img src="media/images/logo.png" alt="NeuroCoder Logo" width="40" align="center"> NeuroCoder: Extensão VS Code para Acessibilidade Neurodivergente

![Versão](https://img.shields.io/badge/versão-2.0.0-blue)
![Downloads](https://img.shields.io/badge/downloads-1k%2B-brightgreen)
![Licença](https://img.shields.io/badge/licença-MIT-yellow)
![VS Code](https://img.shields.io/badge/VS%20Code-Extensão-purple)

## 📖 Descrição
**NeuroCoder** é uma extensão do Visual Studio Code projetada especificamente para **programadores neurodivergentes**, fornecendo ferramentas avançadas de acessibilidade visual para melhorar a experiência de programação.

### ✨ Principais Recursos:
- **Interface Acessível**: Design limpo com temas claro/escuro e fontes amigáveis para dislexia  
- **Modo Foco Inteligente**: Destaca código selecionado com escurecimento contextual  
- **Pomodoro Integrado**: Timer de produtividade integrado no painel de configurações  
- **Realce Dinâmico**: Sistema de destaque de código baseado em cores personalizável  
- **Configurações Neuroinclusivas**: Ajustes refinados para necessidades sensoriais  

## 🚀 Instalação

### Via Marketplace
1. Abra o VS Code  
2. Pressione `Ctrl+Shift+X`  
3. Procure por **"NeuroCoder"**  
4. Clique em **Instalar**

> **Atalhos:**
> - `Ctrl+Alt+S` → Abrir configurações  
> - `Ctrl+Alt+F` → Ativar Modo Foco  
> - `Ctrl+Alt+V` → Adicionar variável  

## 💻 Desenvolvimento
```bash
git clone https://github.com/mari-ww/NeuroCoder.git
cd NeuroCoder
npm install
# Pressione F5 no VS Code para testar
```
## 🎯 Como Usar

### 🧩 Painel de Configurações Visuais (`Ctrl+Alt+S`)
- **Fontes Acessíveis:** OpenDyslexic, Comic Sans MS, Verdana  
- **Ajustes Sensoriais:** Espaçamento de linha e letra personalizável  
- **Temas:** Troca instantânea entre modo claro/escuro  
- **Pré-visualização ao Vivo:** Visualização em tempo real de todas as alterações  

### ⏱️ Sistema Pomodoro Integrado
- **Timer de produtividade 25/5** embutido  
- **Controles diretos** no painel principal  
- **Display de tempo claro** com layout amigável para foco  

### 🎨 Realce de Código
- **Cores totalmente personalizáveis** para marcação de código  
- **Múltiplos realces simultâneos** suportados  
- **Limpeza com um clique** para resetar todas as marcações instantaneamente  

### 🎯 Modo Foco Inteligente
- **Destaque Contextual:** Foca apenas no código selecionado  
- **Escurecimento Adaptativo:** Reduz a visibilidade do código não relevante  
- **Ativação Rápida:** Ative/desative com um simples atalho de teclado  

---

## 📺 Demonstração
<p align="center">
  <img src="media/images/demo.gif" alt="Demonstração NeuroCoder" width="600">
</p>

> **Nota:** A demonstração mostra todas as funcionalidades principais em ação, incluindo o sistema de realce dinâmico e o painel de configurações.

---

## 🛠️ Integração Técnica

### Referência da API do VS Code

| Função                          | Descrição                | Uso no Projeto           |
|----------------------------------|-----------------------------|-----------------------------|
| `createWebviewPanel`             | Cria painéis de UI baseados em web | Painel de configurações visuais       |
| `getConfiguration`               | Lê e grava preferências    | Personalização de fonte/cor    |
| `createTextEditorDecorationType` | Estiliza texto no editor   | Realces & Modo Foco     |
| `window.showQuickPick`           | Mostra seleção rápida      | Escolha de fontes e temas      |
| `workspace.getConfiguration`     | Obtém configurações        | Leitura das preferências salvas |

### Estrutura de Arquivos
```bash
NeuroCoder/
├── src/
│ ├── extension.ts # Ponto de entrada principal
│ ├── settingsPanel.ts # Painel de configurações
│ ├── highlightManager.ts # Gerenciador de realces
│ ├── focusMode.ts # Implementação do modo foco
│ └── pomodoroTimer.ts # Timer Pomodoro
├── media/
│ ├── images/ # Imagens e ícones
│ └── demo.gif # GIF de demonstração
├── package.json # Configuração da extensão
└── README.md # Este arquivo
```
---

## 📦 Dependências

```json
{
  "dependencies": {
    "fastest-levenshtein": "^1.0.16"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "typescript": "^5.3.0",
    "vsce": "^2.15.0"
  }
}
```

---

## 🤝 Contribuindo

- 🐞 **Reportar Bugs:** [Abra uma Issue](https://github.com/mari-ww/NeuroCoder/issues)  
- 💡 **Sugerir Funcionalidades:** Use o template de solicitação de funcionalidades  
- 🔧 **Enviar Pull Requests:** Siga as diretrizes de contribuição  

---

## 🔗 Links Úteis

- 💻 [Repositório GitHub](https://github.com/mari-ww/NeuroCoder)  
- 🚨 [Reportar Problemas](https://github.com/mari-ww/NeuroCoder/issues)  
- 📘 [Documentação da API do VS Code](https://code.visualstudio.com/api)  

---

## 📝 Licença

**Licença MIT** — Veja o arquivo LICENSE para detalhes completos.  

✨ *Construído com acessibilidade em mente* ✨  

> Encontrou um bug? Tem uma ideia? Abra uma [issue](https://github.com/mari-ww/NeuroCoder/issues).

💡 **Dica:** A extensão é completamente gratuita e de código aberto — contribuições são sempre bem-vindas!

---

## 🚧 Roteiro Futuro (Em Breve)

- 🗣️ **Modo Leitura por Voz** — Lê código em voz alta para suporte a processamento auditivo  
- 💬 **Hub de Feedback da Comunidade** — Ajuste colaborativo de acessibilidade  

> 🧩 Fique atento para as próximas atualizações na **v2.1.0+** — seu feedback impulsiona o desenvolvimento!
