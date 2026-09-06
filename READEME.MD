# ◈ VOXIS v1.0
### Assistente Pessoal Inteligente com Voz

---

## 🚀 Como usar

### 1. Estrutura de pastas
```
VOXIS/
├── index.html
├── css/style.css
├── js/
│   ├── app.js
│   ├── voice.js
│   ├── brain.js
│   ├── memory.js
│   ├── supabase.js
│   └── drive.js
├── data/knowledge.json
└── README.md
```

### 2. Abrir o projeto
- Abra `index.html` no **Chrome** ou **Edge**
- Permita acesso ao **microfone** quando solicitado

### 3. Usar
- Clique em **🎙️ Falar** e comece a falar
- Após **3 segundos de silêncio** o VOXIS responde
- Ou **digite** no campo de texto
- Use **📤 Exportar** para salvar histórico

---

## ⚙️ Configurações

### Supabase (banco de dados na nuvem)
1. Acesse https://supabase.com e crie um projeto
2. Vá em **SQL Editor** e execute o SQL em `js/supabase.js`
3. Copie sua **URL** e **anon key**
4. Cole em `js/supabase.js`:
```javascript
config: {
    url:    'https://xxxx.supabase.co',
    apiKey: 'eyJhbGc...'
}
```

### Google Drive (backup)
1. Acesse https://console.cloud.google.com
2. Crie um projeto e ative a **Google Drive API**
3. Crie credenciais **OAuth 2.0**
4. Cole em `js/drive.js`:
```javascript
config: {
    clientId: 'xxxx.apps.googleusercontent.com',
    apiKey:   'AIzaSy...'
}
```

---

## 🧠 Como funciona

| Módulo | Função |
|--------|--------|
| `voice.js` | TTS (1.15x/0.95 pitch) + VAD 3s |
| `brain.js` | Silogismo + Aprendizado + Doce Elogio |
| `memory.js` | Histórico + Export/Import |
| `supabase.js` | Sync na nuvem |
| `drive.js` | Backup Google Drive |

---

## 🗺️ Roadmap

- [x] v1.0 — HTML modular funcional
- [ ] v1.1 — Integração Supabase ativa
- [ ] v1.2 — Google Drive ativo
- [ ] v1.3 — ElevenLabs (clonagem de voz real)
- [ ] v2.0 — APK Android (Capacitor.js)

---

## 📝 Notas
- Funciona melhor no **Chrome** ou **Edge**
- Requer **microfone** para reconhecimento de voz
- Todo aprendizado fica salvo no **localStorage**
