import { useState, useRef, useCallback, useEffect } from 'react';
import {
  generateTTS,
  base64ToBlob,
  pcm16ToWav,
  BUILT_IN_VOICES,
  type TTSModel,
  type AudioFormat,
  type TTSRequest,
  type HistoryItem,
} from './api';
import './App.css';

// ─── Preset styles ───────────────────────────────────────────────
const STYLE_PRESETS = [
  { label: '默认', value: '' },
  { label: '开心活泼', value: 'Bright, bouncy, slightly sing-song tone — like bursting with good news. Fast pace, rising pitch at the end.' },
  { label: '温柔低语', value: 'Gentle whisper, soft and intimate, as if sharing a secret. Slow pace, breathy quality.' },
  { label: '新闻播报', value: 'Professional news anchor tone, clear and authoritative, moderate pace, confident delivery.' },
  { label: '讲故事', value: 'Warm storytelling voice, engaging and expressive, with natural pauses for dramatic effect.' },
  { label: '东北话', value: '(东北话)' },
  { label: '四川话', value: '(四川话)' },
  { label: '粤语', value: '(粤语)' },
  { label: '唱歌', value: '(唱歌)' },
  { label: '懒洋洋', value: '(懒洋洋)' },
  { label: '磁性男声', value: '(磁性)' },
  { label: '甜美女声', value: '(甜美)' },
  { label: '夹子音', value: '(夹子音)' },
  { label: '大叔音', value: '(大叔音)' },
];

// ─── Voice Design presets ────────────────────────────────────────
const VOICE_DESIGN_PRESETS = [
  { label: '自定义', value: '' },
  { label: '温柔女声', value: 'A young woman in her mid-20s, warm and gentle voice, silky and mellow, speaking at a relaxed pace.' },
  { label: '磁性男声', value: 'A deep, gravelly male voice in his 30s, magnetic and confident, with a slight rasp.' },
  { label: '活力少女', value: 'A bright, energetic teenage girl voice, bubbly and enthusiastic, fast-paced and cheerful.' },
  { label: '沧桑老者', value: 'An elderly gentleman, slow and steady speech, slightly hoarse and weathered, full of wisdom.' },
  { label: 'ASMR 耳语', value: 'Young female, extreme close-up ASMR feel. Audible breathing, subtle lip sounds. Speaks very slowly, deeply relaxing.' },
  { label: '播客主持人', value: 'A charismatic podcast host in his 30s, conversational and engaging, natural rhythm, warm and relatable.' },
  { label: '电影旁白', value: 'A cinematic narrator with a deep, resonant voice, dramatic and powerful, like a movie trailer voiceover.' },
];

// ─── Tag snippets for quick insert ───────────────────────────────
const TAG_SNIPPETS = [
  { label: '叹气', tag: '[叹气]' },
  { label: '深呼吸', tag: '[深吸一口气]' },
  { label: '笑', tag: '[笑]' },
  { label: '大笑', tag: '[大笑]' },
  { label: '哭泣', tag: '[啜泣]' },
  { label: '紧张', tag: '[紧张]' },
  { label: '颤抖', tag: '[声音颤抖]' },
  { label: '停顿', tag: '[停顿]' },
];

function App() {
  // ─── State ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tts-theme') as 'light' | 'dark') || 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tts-theme', theme);
  }, [theme]);

  const [model, setModel] = useState<TTSModel>('mimo-v2.5-tts');
  const [text, setText] = useState('你好，欢迎使用小米 MiMo 语音合成服务。今天天气真不错，让我们一起开始吧！');
  const [styleInstruction, setStyleInstruction] = useState('');
  const [selectedStylePreset, setSelectedStylePreset] = useState('默认');
  const [voice, setVoice] = useState('mimo_default');
  const [voiceDesignPrompt, setVoiceDesignPrompt] = useState('');
  const [selectedVoiceDesignPreset, setSelectedVoiceDesignPreset] = useState('自定义');
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('wav');
  const [optimizeTextPreview, setOptimizeTextPreview] = useState(true);
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloneBase64, setCloneBase64] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAudio, setCurrentAudio] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // ─── Load history from localStorage ────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tts-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      // Keep max 20 items, only save metadata (not audio urls which are blob URLs)
      const toSave = items.slice(0, 20).map(({ audioUrl, ...rest }) => rest);
      localStorage.setItem('tts-history-meta', JSON.stringify(toSave));
    } catch {}
  }, []);

  // ─── Handle file upload for voice cloning ───────────────────────
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(wav|mp3)$/i)) {
      setError('仅支持 WAV 和 MP3 格式');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('音频文件不能超过 10MB');
      return;
    }
    setError('');
    setCloneFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const mime = file.name.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
      setCloneBase64(`data:${mime};base64,${base64}`);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  // ─── Insert tag at cursor position ─────────────────────────────
  const insertTag = useCallback((tag: string) => {
    const textarea = textRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + tag + text.slice(end);
    setText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  }, [text]);

  // ─── Generate TTS ──────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('请输入要合成的文本');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentAudio('');

    try {
      const req: TTSRequest = {
        model,
        text: text.trim(),
        audioFormat,
        stream: false,
      };

      if (model === 'mimo-v2.5-tts') {
        req.voice = voice;
        if (styleInstruction.trim()) {
          req.styleInstruction = styleInstruction.trim();
        }
      } else if (model === 'mimo-v2.5-tts-voicedesign') {
        req.voiceDesignPrompt = voiceDesignPrompt.trim();
        req.optimizeTextPreview = optimizeTextPreview;
      } else if (model === 'mimo-v2.5-tts-voiceclone') {
        req.voice = cloneBase64;
        if (styleInstruction.trim()) {
          req.styleInstruction = styleInstruction.trim();
        }
      }

      const response = await generateTTS(req);

      // Convert to playable blob URL
      let blob: Blob;
      if (response.format === 'pcm16') {
        blob = pcm16ToWav(response.audioData);
      } else {
        blob = base64ToBlob(response.audioData, response.format);
      }
      const url = URL.createObjectURL(blob);
      setCurrentAudio(url);

      // Add to history
      const item: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        request: req,
        audioUrl: url,
      };
      saveHistory([item, ...history]);
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally {
      setLoading(false);
    }
  }, [model, text, voice, styleInstruction, voiceDesignPrompt, audioFormat, optimizeTextPreview, cloneBase64, history, saveHistory]);

  // ─── Play history item ─────────────────────────────────────────
  const playHistory = useCallback((item: HistoryItem) => {
    setCurrentAudio(item.audioUrl);
    setTimeout(() => audioRef.current?.play(), 100);
  }, []);

  // ─── Download audio ────────────────────────────────────────────
  const downloadAudio = useCallback(() => {
    if (!currentAudio) return;
    const a = document.createElement('a');
    a.href = currentAudio;
    a.download = `tts-${Date.now()}.wav`;
    a.click();
  }, [currentAudio]);

  // ─── Model descriptions ────────────────────────────────────────
  const modelInfo: Record<TTSModel, { title: string; desc: string }> = {
    'mimo-v2.5-tts': { title: '内置音色', desc: '使用高质量内置音色，支持风格控制和唱歌' },
    'mimo-v2.5-tts-voicedesign': { title: '声音设计', desc: '通过文字描述自定义音色，无需音频样本' },
    'mimo-v2.5-tts-voiceclone': { title: '声音克隆', desc: '上传音频样本，精准复刻目标音色' },
  };

  return (
    <div className="app">
      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <h1>MiMo TTS Playground</h1>
          </div>
          <div className="header-right">
            <a
              href="https://github.com/sergioperezcheco/MiMoTTS"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <button
              className="theme-toggle"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? '切换暗色' : '切换亮色'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <span className="badge">Xiaomi MiMo-V2.5-TTS</span>
          </div>
        </div>
      </header>

      <main className="main">
        {/* ─── Left Panel: Controls ───────────────────────────── */}
        <div className="panel controls-panel">
          {/* Model Selection */}
          <section className="section">
            <h2 className="section-title">模型</h2>
            <div className="model-grid">
              {(Object.keys(modelInfo) as TTSModel[]).map((m) => (
                <button
                  key={m}
                  className={`model-card ${model === m ? 'active' : ''}`}
                  onClick={() => setModel(m)}
                >
                  <span className="model-title">{modelInfo[m].title}</span>
                  <span className="model-desc">{modelInfo[m].desc}</span>
                  <span className="model-id">{m}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Voice Selection (built-in model only) */}
          {model === 'mimo-v2.5-tts' && (
            <section className="section">
              <h2 className="section-title">音色</h2>
              <div className="voice-grid">
                {BUILT_IN_VOICES.map((v) => (
                  <button
                    key={v.id}
                    className={`voice-chip ${voice === v.id ? 'active' : ''}`}
                    onClick={() => setVoice(v.id)}
                  >
                    <span className="voice-name">{v.name}</span>
                    <span className="voice-meta">{v.language} · {v.gender}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Voice Clone Upload */}
          {model === 'mimo-v2.5-tts-voiceclone' && (
            <section className="section">
              <h2 className="section-title">上传音频样本</h2>
              <label
                className={`upload-zone ${dragging ? 'upload-zone--dragging' : ''} ${cloneFile ? 'upload-zone--has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".wav,.mp3"
                  onChange={handleFileChange}
                  className="upload-input"
                />
                {cloneFile ? (
                  <div className="upload-info">
                    <span className="upload-icon">✅</span>
                    <span>{cloneFile.name}</span>
                    <span className="upload-size">
                      ({(cloneFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">{dragging ? '📥' : '📁'}</span>
                    <span>{dragging ? '松开即可上传' : '点击或拖拽 WAV/MP3 文件到此处'}</span>
                    <span className="upload-hint">支持 .wav .mp3 · 最大 10MB</span>
                  </div>
                )}
              </label>
            </section>
          )}

          {/* Voice Design Prompt */}
          {model === 'mimo-v2.5-tts-voicedesign' && (
            <section className="section">
              <h2 className="section-title">声音描述</h2>
              <div className="preset-row">
                {VOICE_DESIGN_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className={`preset-chip ${selectedVoiceDesignPreset === p.label ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedVoiceDesignPreset(p.label);
                      if (p.value) setVoiceDesignPrompt(p.value);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <textarea
                className="textarea small"
                placeholder="描述你想要的音色，例如：A young woman in her mid-20s, warm and gentle voice..."
                value={voiceDesignPrompt}
                onChange={(e) => setVoiceDesignPrompt(e.target.value)}
                rows={3}
              />
            </section>
          )}

          {/* Style Control (built-in & clone models) */}
          {(model === 'mimo-v2.5-tts' || model === 'mimo-v2.5-tts-voiceclone') && (
            <section className="section">
              <h2 className="section-title">
                风格控制
                <span className="section-hint">（可选 · 自然语言描述）</span>
              </h2>
              <div className="preset-row">
                {STYLE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className={`preset-chip ${selectedStylePreset === p.label ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedStylePreset(p.label);
                      setStyleInstruction(p.value);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <textarea
                className="textarea small"
                placeholder="用自然语言描述语音风格，例如：用欢快活泼的语气，语速稍快..."
                value={styleInstruction}
                onChange={(e) => setStyleInstruction(e.target.value)}
                rows={2}
              />
            </section>
          )}

          {/* Audio Format */}
          <section className="section">
            <h2 className="section-title">音频格式</h2>
            <div className="format-row">
              {(['wav', 'pcm16'] as AudioFormat[]).map((f) => (
                <button
                  key={f}
                  className={`format-btn ${audioFormat === f ? 'active' : ''}`}
                  onClick={() => setAudioFormat(f)}
                >
                  {f.toUpperCase()}
                  <span className="format-hint">
                    {f === 'wav' ? '可直接播放' : 'PCM 原始数据'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Optimize Text Preview (voice design only) */}
          {model === 'mimo-v2.5-tts-voicedesign' && (
            <section className="section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={optimizeTextPreview}
                  onChange={(e) => setOptimizeTextPreview(e.target.checked)}
                />
                <span>智能润色文本</span>
                <span className="checkbox-hint">开启后可省略 assistant 消息</span>
              </label>
            </section>
          )}
        </div>

        {/* ─── Right Panel: Text & Output ─────────────────────── */}
        <div className="panel output-panel">
          {/* Text Input */}
          <section className="section">
            <h2 className="section-title">
              合成文本
              <span className="section-hint">
                {model === 'mimo-v2.5-tts' && '支持 [音频标签] 插入'}
              </span>
            </h2>

            {/* Tag quick insert */}
            {model === 'mimo-v2.5-tts' && (
              <div className="tag-row">
                <span className="tag-label">快速插入：</span>
                {TAG_SNIPPETS.map((t) => (
                  <button
                    key={t.label}
                    className="tag-btn"
                    onClick={() => insertTag(t.tag)}
                    title={t.tag}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textRef}
              className="textarea main-textarea"
              placeholder="输入要合成的文本..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <div className="text-footer">
              <span className="char-count">{text.length} 字符</span>
            </div>
          </section>

          {/* Generate Button */}
          <button
            className={`generate-btn ${loading ? 'loading' : ''}`}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                生成中...
              </>
            ) : (
              <>
                <span>🔊</span>
                生成语音
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Audio Player */}
          {currentAudio && (
            <section className="section player-section">
              <h2 className="section-title">播放</h2>
              <div className="player-card">
                <audio
                  ref={audioRef}
                  src={currentAudio}
                  controls
                  autoPlay
                  className="audio-player"
                />
                <button className="download-btn" onClick={downloadAudio}>
                  ⬇️ 下载
                </button>
              </div>
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className="section">
              <h2 className="section-title">
                历史记录
                <button
                  className="clear-btn"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('tts-history-meta');
                  }}
                >
                  清空
                </button>
              </h2>
              <div className="history-list">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => playHistory(item)}
                  >
                    <div className="history-text">
                      {item.request.text.slice(0, 60)}
                      {item.request.text.length > 60 ? '...' : ''}
                    </div>
                    <div className="history-meta">
                      <span>{item.request.model.replace('mimo-v2.5-tts', '').replace('-', '') || '内置音色'}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        <span>Powered by Xiaomi MiMo-V2.5-TTS Series</span>
        <span>·</span>
        <span>API: token-plan-sgp.xiaomimimo.com</span>
      </footer>
    </div>
  );
}

export default App;
