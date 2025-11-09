<template>
  <div class="chat-wrapper" :class="{ dark: isDarkMode }">
    <div class="chat-header">
      <strong>Chat</strong>
      <div class="btn-group">
        <button class="btn btn-sm btn-outline-warning" @click="confirmDeleteMine" title="Saját üzeneteim törlése">
          <i class="fas fa-trash"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="$emit('toggle')">
          <i class="fas fa-chevron-down"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" @click.prevent="handleClose" title="Bezárás">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="chat-body" ref="scrollArea">
      <div v-if="messages.length === 0" class="empty">Nincs üzenet</div>
      <div
        v-for="(m,i) in messages"
        :key="i"
        class="msg"
        :class="{ mine: isMine(m) }"
      >
        <div class="meta">
          <span class="author">{{ getAuthorLabel(m) }}</span>
          <span class="time">{{ formatTime(m) }}</span>
        </div>
        <div class="text">{{ m.text }}</div>
      </div>
    </div>
    <form class="chat-input" @submit.prevent="send">
      <input v-model="draft" type="text" placeholder="Üzenet..." @keydown.enter.exact.prevent="send" />
      <button class="btn btn-sm btn-primary" :disabled="!draft.trim()">Küldés</button>
    </form>
  </div>
</template>

<script>
import axiosBase from 'axios';
import auth from '../services/auth';
const chatApi = axiosBase.create({ baseURL: 'http://localhost:3005' });

export default {
  name: 'Chat',
  emits: ['close','toggle','has-unread'],
  props: {
    isDarkMode: Boolean,
    // opcionális külső azonosító; ensureAuthUser felülírja, ha elérhető
    currentUserId: { type: String, default: '' },
    // KÖTELEZŐ: a rendezvény (kerveny) azonosítója, ehhez kötjük a chatet
    kervenyId: { type: [Number, String], required: true }
  },
  data() {
    return {
      draft: '',
      messages: [],
      lastFetchTs: null,
      initialLoaded: false,
      poll: null,
      meId: null,
      meName: null,
      lastSeenAt: null,
      unreadCount: 0,
      markedInitialSeen: false
    };
  },
  async mounted() {
    await this.initMe();
    await this.fetchMessages(true);
    this.poll = setInterval(() => this.fetchMessages(false), 5000);
    this.$nextTick(this.scrollToBottom);
    window.addEventListener('keydown', this.onKeydown);
  },
  // Vue 2 és 3 kompatibilis takarítás
  beforeUnmount() {
    if (this.poll) clearInterval(this.poll);
    window.removeEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    if (this.poll) clearInterval(this.poll);
    window.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    async initMe() {
      try {
        const user = await auth.ensureAuthUser();
        console.debug('[chat] ensureAuthUser()', user);
        if (user) {
          const name =
            user.username ||
            user.userName ||
            user.full_name ||
            user.fullName ||
            user.name ||
            user.email ||
            (user.id != null ? String(user.id) : '');
          this.meId = String(user.id || name || 'User');
          this.meName = String(name || '');
          return;
        }
      } catch {}
      this.meId = this.currentUserId || 'User';
      this.meName = '';
    },

    isMine(m) {
      const mid = String(this.meId || '');
      return (
        (m.author_id && String(m.author_id) === mid) ||
        (m.authorId && String(m.authorId) === mid) ||
        (m.author && String(m.author) === mid)
      );
    },

    getAuthorLabel(m) {
      return this.isMine(m) ? (this.meName || 'Én') : (m.author_name || m.authorName || 'Ismeretlen');
    },

    async fetchMessages(full = false) {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const qs = new URLSearchParams();
        if (this.kervenyId != null) qs.set('kervenyId', String(this.kervenyId));
        if (!full && this.lastFetchTs) qs.set('since', String(this.lastFetchTs));
        // első teljes betöltéskor kérhetjük a markSeen=1-et
        if (full && !this.markedInitialSeen) qs.set('markSeen','1');

        const { data } = await chatApi.get(`/api/chat/messages?${qs.toString()}`, { headers });
        let incoming = [];
        if (Array.isArray(data)) {
          incoming = data;
        } else if (data && Array.isArray(data.messages)) {
          incoming = data.messages;
          this.lastSeenAt = data.lastSeenAt || null;
          this.unreadCount = data.unreadCount || 0;
          this.$emit('has-unread', this.unreadCount > 0);
          if (full && !this.markedInitialSeen) this.markedInitialSeen = true;
        } else {
          return;
        }

        if (!this.initialLoaded || full) {
          this.messages = incoming;
          this.initialLoaded = true;
        } else if (incoming.length) {
          const byId = new Map(this.messages.map(m => [m.id, m]));
          for (const m of incoming) byId.set(m.id, m);
          this.messages = Array.from(byId.values()).sort((a,b) =>
            new Date(a.created_at) - new Date(b.created_at)
          );
        }

        const last = this.messages[this.messages.length - 1];
        if (last?.created_at) {
          const ts = Date.parse(last.created_at);
          if (!Number.isNaN(ts)) this.lastFetchTs = ts + 1;
        }
        // ha új üzenetek jöttek és mi láttuk (komponens nyitva), jelöljük seen-re
        if (incoming.length && document.hasFocus()) {
          await this.markSeen();
        }

        this.$nextTick(this.scrollToBottom);
      } catch (e) {
        if (e?.response?.status === 401) {
          console.warn('[chat] auth lejárt, jelentkezz be újra');
        } else {
          console.warn('[chat] fetch error:', e?.message || e);
        }
      }
    },

    async markSeen() {
      const kid = Number(this.kervenyId);
      if (!Number.isInteger(kid) || kid <= 0) return;
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        await chatApi.post('/api/chat/seen', { kervenyId: kid }, { headers });
        this.lastSeenAt = new Date().toISOString();
        this.unreadCount = 0;
        this.$emit('has-unread', false);
      } catch (e) {
        console.warn('[chat] markSeen hiba:', e?.message || e);
      }
    },

    async send() {
      const t = this.draft.trim();
      if (!t) return;
      const kid = Number(this.kervenyId);
      if (!Number.isInteger(kid) || kid <= 0) return;

      let authorName = '';
      try {
        const u = await auth.ensureAuthUser();
        authorName = (
          u?.username ||
          u?.userName ||
          u?.full_name ||
          u?.fullName ||
          u?.name ||
          u?.email ||
          (u?.id != null ? String(u.id) : '')
        ) || '';
        authorName = authorName.trim();
        if (!authorName) console.warn('[chat] nincs név mező az auth user objektumban');
      } catch (e) {
        console.warn('[chat] ensureAuthUser hiba:', e?.message || e);
      }
      // ha üres marad, küldjük az meId-t, hogy backend ne dobjon 400-at
      if (!authorName) authorName = this.meId || 'user';

      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = { text: t, kervenyId: kid, authorName };

      try {
        const { data } = await chatApi.post('/api/chat/messages', payload, { headers });
        this.messages.push(data);
        const ts = Date.parse(data.created_at);
        if (!Number.isNaN(ts)) this.lastFetchTs = Math.max(this.lastFetchTs || 0, ts + 1);
        // saját üzenet után nincs unread
        await this.markSeen();
      } catch (e) {
        console.error('[chat send] error', e?.response?.data || e.message || e);
      } finally {
        this.draft = '';
        this.$nextTick(this.scrollToBottom);
      }
    },

    scrollToBottom() {
      const el = this.$refs.scrollArea;
      if (el) el.scrollTop = el.scrollHeight;
    },

    onStorage(e) {
      if (e.key === 'chat_messages') {
        this.loadMessages();
        this.$nextTick(this.scrollToBottom);
      }
    },

    formatTime(m) {
      const raw =
        m?.created_at || m?.createdAt || m?.time || m?.timestamp || m?.created || null;
      const d = typeof raw === 'number' ? new Date(raw) : new Date(String(raw));
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    },

    async confirmDeleteMine() {
      if (!confirm('Biztosan törlöd az összes általad küldött üzenetet?')) return;
      await this.deleteMyMessages();
    },
    async deleteMyMessages() {
      const kid = Number(this.kervenyId);
      if (!Number.isInteger(kid) || kid <= 0) return;
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const { data } = await chatApi.delete(`/api/chat/messages?kervenyId=${kid}&scope=mine`, { headers });
        // Töröljük a kliens listából a saját üzeneteket
        this.messages = this.messages.filter(m => !this.isMine(m));
        console.info('[chat] törölve (saját):', data?.deleted ?? 0);
      } catch (e) {
        console.error('[chat] törlés hiba:', e?.response?.data || e.message || e);
      }
    },
    onKeydown(e) {
      if (e.key === 'Escape') this.handleClose();
    },
    handleClose() {
      try { if (this.poll) clearInterval(this.poll); } catch {}
      this.$emit('close');
    },
  }
};
</script>

<style scoped>
/* Megnyitáskor a jobb alsó sarokban jelenjen meg (viewporthoz rögzítve) */
.chat-wrapper {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 360px;
  max-width: calc(100vw - 24px);
  height: 420px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #1a1f30;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  z-index: 3000;
  animation: popIn .15s ease;
}
.dark.chat-wrapper { background:#1e1e1e; color:#eee; border-color:#303642; }

@keyframes popIn {
  from { opacity: 0; transform: translate3d(0,12px,0) scale(.98); }
  to   { opacity: 1; transform: translate3d(0,0,0) scale(1); }
}

.chat-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:.45rem .65rem;
  background:#242943; color:#fff; font-size:.8rem;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.dark .chat-header { background:#131722; }

.chat-body { flex:1; overflow-y:auto; padding:.4rem .55rem .6rem; font-size:.72rem; }
.empty { text-align:center; margin-top:1.2rem; opacity:.6; }

.msg { margin-bottom:.5rem; padding:.4rem .55rem .45rem; background:#e9edf3; border-radius:6px; max-width:92%; } /* kicsit szürkébb */
.dark .msg { background:#2a2e36; } /* enyhén szürkébb darkban */

/* Saját üzenet: sötétkék mint a header */
.msg.mine {
  background:#242943;
  color:#fff;
  margin-left:auto;
  box-shadow:0 0 0 1px rgba(255,255,255,0.06);
}
.dark .msg.mine {
  background:#131722;
  color:#fff;
  box-shadow:0 0 0 1px rgba(255,255,255,0.08);
}

.meta {
  display:flex; justify-content:space-between; font-size:.55rem; opacity:.65; margin-bottom:2px;
}
.msg.mine .meta { opacity:.8; }

.text { white-space:pre-wrap; word-break:break-word; }

.chat-input {
  display:flex; gap:.45rem; padding:.45rem .55rem .5rem;
  border-top:1px solid #1a1f30;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
.dark .chat-input { border-color:#303642; }

.chat-input input {
  flex:1; border:1px solid #b9c2d0; border-radius:4px; padding:.4rem .55rem; font-size:.75rem;
  background:#fff;
}
.dark .chat-input input { background:#252a33; color:#eee; border-color:#3d4653; }
.chat-input button { font-size:.7rem; padding:.4rem .8rem; }

/* Mobilon kitölti a szélességet és magasabb */
@media (max-width: 600px) {
  .chat-wrapper {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
    height: 55vh;
  }
}
</style>