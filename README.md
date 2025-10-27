# <img src="media/images/logo.png" alt="NeuroCoder Logo" width="40" align="center"> NeuroCoder: VS Code Extension for Neurodivergent Accessibility

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Downloads](https://img.shields.io/badge/downloads-1k%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-yellow)
![VS Code](https://img.shields.io/badge/VS%20Code-Extension-purple)

## 📖 Description
**NeuroCoder** is a Visual Studio Code extension designed specifically for **neurodivergent programmers**, providing advanced visual accessibility tools to enhance the coding experience.

### ✨ Key Features:
- **Accessible Interface**: Clean design with light/dark themes and dyslexia-friendly fonts  
- **Smart Focus Mode**: Highlights selected code with contextual dimming  
- **Integrated Pomodoro**: Built-in productivity timer in the settings panel  
- **Dynamic Highlighting**: Customizable color-based code highlighting system  
- **Neuro-inclusive Settings**: Fine-tuned adjustments for sensory needs  

## 🚀 Installation

### Via Marketplace
1. Open VS Code  
2. Press `Ctrl+Shift+X`  
3. Search for **"NeuroCoder"**  
4. Click **Install**

> **Shortcuts:**
> - `Ctrl+Alt+S` → Open settings  
> - `Ctrl+Alt+F` → Activate Focus Mode  
> - `Ctrl+Alt+V` → Add variable  

## 💻 Development
```bash
git clone https://github.com/mari-ww/NeuroCoder.git
cd NeuroCoder
npm install
# Press F5 in VS Code to test
```

## 🎯 How to Use

### 🧩 Visual Settings Panel (`Ctrl+Alt+S`)
- **Accessible Fonts:** OpenDyslexic, Comic Sans MS, Verdana  
- **Sensory Adjustments:** Customizable line and letter spacing  
- **Themes:** Instant light/dark mode switching  
- **Live Preview:** Real-time visualization of all changes  

### ⏱️ Integrated Pomodoro System
- Built-in **25/5 productivity timer**  
- **Direct controls** in the main panel  
- **Clear time display** with focus-friendly layout  

### 🎨 Code Highlighting
- **Fully customizable colors** for code marking  
- **Multiple simultaneous highlights** supported  
- **One-click clear** to reset all markings instantly  

---

## 📺 Demo
<p align="center">
  <img src="media/images/demo.gif" alt="NeuroCoder Demo" width="600">
</p>

---

## 🛠️ Technical Integration

### VS Code API Reference

| Function                          | Description                | Usage in Project           |
|----------------------------------|-----------------------------|-----------------------------|
| `createWebviewPanel`             | Creates web-based UI panels | Visual settings panel       |
| `getConfiguration`               | Reads and writes preferences| Font/color customization    |
| `createTextEditorDecorationType` | Styles text in editor       | Highlights & Focus Mode     |

---

## 📦 Dependencies

```json
"dependencies": {
  "fastest-levenshtein": "^1.0.16"
}
```

## 🤝 Contributing

- 🐞 **Report Bugs:** [Open an Issue](https://github.com/mari-ww/NeuroCoder/issues)  
- 💡 **Suggest Features:** Use the feature request template  
- 🔧 **Submit Pull Requests:** Follow the contribution guidelines  

---

## 🔗 Useful Links

- 💻 [GitHub Repository](https://github.com/mari-ww/NeuroCoder)  
- 🚨 [Report Issues](https://github.com/mari-ww/NeuroCoder/issues)  
- 📘 [VS Code API Documentation](https://code.visualstudio.com/api)  

---

## 📝 License

**MIT License** — See the LICENSE file for full details.  

✨ *Built with accessibility in mind* ✨  

> Found a bug? Got an idea? Open an [issue](https://github.com/mari-ww/NeuroCoder/issues).

💡 **Tip:** The extension is completely free and open-source — contributions are always welcome!

---

## 🚧 Future Roadmap (Coming Soon)

- 🗣️ **Voice Reading Mode** — Reads code aloud for auditory processing support  
- 🎨 **Color-Blind Friendly Themes** — Extended palette for visual inclusivity  
- 💬 **Community Feedback Hub** — Collaborative accessibility tuning  

> 🧩 Stay tuned for upcoming updates in **v2.1.0+** — your feedback drives development!
