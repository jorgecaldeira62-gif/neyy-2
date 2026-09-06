// ============================================================
// VOXIS — supabase.js
// Integração Supabase — preparado para ativar com suas chaves
// ============================================================

const SupabaseDB = {

  // 🔧 CONFIGURE AQUI suas credenciais do Supabase
  config: {
    url: 'SUA_SUPABASE_URL_AQUI',
    apiKey: 'SUA_SUPABASE_ANON_KEY_AQUI',
    table: 'voxis_history'
  },

  isConfigured: false,
  client: null,

  // ===== INICIALIZAR =====
  init() {
    if (
      this.config.url !== 'SUA_SUPABASE_URL_AQUI' &&
      this.config.apiKey !== 'SUA_SUPABASE_ANON_KEY_AQUI'
    ) {
      this.isConfigured = true;
      this.connect();
    } else {
      console.log('☁️ Supabase: aguardando configuração.');
      document.getElementById('supabaseStatus').textContent = '⚙️ Config';
    }
  },

  // ===== CONECTAR =====
  async connect() {
    try {
      // Carrega SDK do Supabase dinamicamente
      if (!window.supabase) {
        await this.loadSDK();
      }
      this.client = window.supabase.createClient(this.config.url, this.config.apiKey);
      document.getElementById('supabaseStatus').textContent = '✅ Ativo';
      document.getElementById('supabaseStatus').className = 'badge badge-green';
      console.log('☁️ Supabase conectado!');
    } catch (e) {
      console.error('Erro Supabase:', e);
      document.getElementById('supabaseStatus').textContent = '❌ Erro';
      document.getElementById('supabaseStatus').className = 'badge badge-red';
    }
  },

  // ===== CARREGAR SDK =====
  loadSDK() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // ===== SINCRONIZAR =====
  async sync() {
    if (!this.isConfigured) {
      alert('⚙️ Configure o Supabase em js/supabase.js com sua URL e API Key.\n\nAcesse: https://supabase.com');
      return;
    }

    if (!this.client) {
      await this.connect();
    }

    try {
      App.setStatus('thinking', 'Sincronizando...');
      const data = Memory.getData();

      // Envia histórico não sincronizado
      const unsyncedMessages = data.history.filter(m => !m.synced);

      if (unsyncedMessages.length === 0) {
        App.addMessage('voxis', '☁️ Tudo já está sincronizado com o Supabase!');
        App.setStatus('', 'Pronto');
        return;
      }

      const { error } = await this.client
        .from(this.config.table)
        .insert(unsyncedMessages.map(m => ({
          role: m.role,
          text: m.text,
          timestamp: m.time,
          session: data.sessions
        })));

      if (error) throw error;

      // Marca como sincronizado
      data.history = data.history.map(m => ({ ...m, synced: true }));
      Memory.setData(data);

      App.addMessage('voxis', `☁️ Sincronizei ${unsyncedMessages.length} mensagens com o Supabase!`);
      App.setStatus('', 'Pronto');

    } catch (e) {
      console.error('Erro ao sincronizar:', e);
      App.addMessage('voxis', '❌ Erro ao sincronizar. Verifique sua conexão e configurações.');
      App.setStatus('', 'Pronto');
    }
  },

  // ===== BUSCAR HISTÓRICO DA NUVEM =====
  async fetchFromCloud() {
    if (!this.client) return [];
    try {
      const { data, error } = await this.client
        .from(this.config.table)
        .select('*')
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Erro ao buscar da nuvem:', e);
      return [];
    }
  },

  // ===== SQL PARA CRIAR TABELA =====
  // Execute isso no Supabase SQL Editor:
  getCreateTableSQL() {
    return `
CREATE TABLE IF NOT EXISTS voxis_history (
    id         BIGSERIAL PRIMARY KEY,
    role       TEXT NOT NULL,
    text       TEXT NOT NULL,
    timestamp  TIMESTAMPTZ DEFAULT NOW(),
    session    INTEGER DEFAULT 1,
    synced     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_voxis_timestamp ON voxis_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_voxis_session   ON voxis_history(session);

-- Habilita RLS (Row Level Security)
ALTER TABLE voxis_history ENABLE ROW LEVEL SECURITY;

-- Política pública (ajuste conforme necessidade)
CREATE POLICY "Allow all" ON voxis_history FOR ALL USING (true);
        `;
  }
};
     
