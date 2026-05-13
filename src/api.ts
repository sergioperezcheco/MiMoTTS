// MiMo TTS API client — calls our own /api/tts proxy (Cloudflare Pages Function)

export type TTSModel = 'mimo-v2.5-tts' | 'mimo-v2.5-tts-voicedesign' | 'mimo-v2.5-tts-voiceclone';

export type AudioFormat = 'wav' | 'pcm16';

export interface BuiltInVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export const BUILT_IN_VOICES: BuiltInVoice[] = [
  { id: 'mimo_default', name: 'MiMo 默认', language: '自动', gender: '自动' },
  { id: '冰糖', name: '冰糖', language: '中文', gender: '女' },
  { id: '茉莉', name: '茉莉', language: '中文', gender: '女' },
  { id: '苏打', name: '苏打', language: '中文', gender: '男' },
  { id: '白桦', name: '白桦', language: '中文', gender: '男' },
  { id: 'Mia', name: 'Mia', language: 'English', gender: 'Female' },
  { id: 'Chloe', name: 'Chloe', language: 'English', gender: 'Female' },
  { id: 'Milo', name: 'Milo', language: 'English', gender: 'Male' },
  { id: 'Dean', name: 'Dean', language: 'English', gender: 'Male' },
];

export interface TTSRequest {
  model: TTSModel;
  text: string;           // assistant content - the text to synthesize
  styleInstruction?: string; // user content - natural language style control
  voice?: string;          // voice id for built-in voices or base64 for clone
  voiceDesignPrompt?: string; // user content for voice design model
  audioFormat: AudioFormat;
  optimizeTextPreview?: boolean; // for voice design model
  stream?: boolean;
}

export interface TTSResponse {
  audioData: string; // base64 encoded audio
  format: AudioFormat;
  model: TTSModel;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: TTSRequest;
  audioUrl: string;
  duration?: number;
}

export async function generateTTS(req: TTSRequest): Promise<TTSResponse> {
  const messages: Array<{ role: string; content: string }> = [];

  // Build messages based on model
  if (req.model === 'mimo-v2.5-tts') {
    // Built-in voice model
    if (req.styleInstruction) {
      messages.push({ role: 'user', content: req.styleInstruction });
    }
    messages.push({ role: 'assistant', content: req.text });
  } else if (req.model === 'mimo-v2.5-tts-voicedesign') {
    // Voice design model - user message is the voice description
    messages.push({ role: 'user', content: req.voiceDesignPrompt || '' });
    messages.push({ role: 'assistant', content: req.text });
  } else if (req.model === 'mimo-v2.5-tts-voiceclone') {
    // Voice clone model
    if (req.styleInstruction) {
      messages.push({ role: 'user', content: req.styleInstruction });
    } else {
      messages.push({ role: 'user', content: '' });
    }
    messages.push({ role: 'assistant', content: req.text });
  }

  // Build audio config
  const audioConfig: Record<string, any> = {
    format: req.audioFormat,
  };

  if (req.model === 'mimo-v2.5-tts' && req.voice) {
    audioConfig.voice = req.voice;
  } else if (req.model === 'mimo-v2.5-tts-voiceclone' && req.voice) {
    audioConfig.voice = req.voice; // base64 with data: prefix
  }

  if (req.model === 'mimo-v2.5-tts-voicedesign' && req.optimizeTextPreview) {
    audioConfig.optimize_text_preview = true;
  }

  const body = {
    model: req.model,
    messages,
    audio: audioConfig,
    stream: false,
  };

  // Call our own proxy endpoint (Cloudflare Pages Function)
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const audioData = data.choices?.[0]?.message?.audio?.data;

  if (!audioData) {
    throw new Error('No audio data in response');
  }

  return {
    audioData,
    format: req.audioFormat,
    model: req.model,
  };
}

export function base64ToBlob(base64: string, format: AudioFormat): Blob {
  const mimeMap: Record<AudioFormat, string> = {
    wav: 'audio/wav',
    pcm16: 'audio/pcm',
  };
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeMap[format] });
}

export function pcm16ToWav(pcmBase64: string, sampleRate = 24000): Blob {
  const binary = atob(pcmBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = bytes.length;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  const uint8 = new Uint8Array(buffer);
  uint8.set(bytes, headerSize);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
