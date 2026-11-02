const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

function decodeRecording(mime, audio) {
  const contentType = typeof mime === 'string' ? mime.toLowerCase() : '';
  const format = contentType.startsWith('audio/webm') ? 'webm' : contentType.startsWith('audio/ogg') ? 'ogg'
    : contentType.startsWith('audio/mp4') ? 'mp4' : contentType.startsWith('audio/wav') ? 'wav' : null;
  if (!format || typeof audio !== 'string' || audio.length > 8_000_000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(audio)) {
    throw new Error('The voice recording format or size is unsupported. Keep it under 20 seconds.');
  }
  const bytes = Buffer.from(audio, 'base64');
  if (bytes.length < 1000 || bytes.length > 6_000_000) throw new Error('The voice recording is empty or too large.');
  return { bytes, contentType, format };
}

async function transcribeRecording(recording, apiKey, fetcher = fetch) {
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured on the backend.');
  const { bytes, contentType, format } = decodeRecording(recording.mime, recording.audio);
  const form = new FormData();
  form.append('model', 'whisper-large-v3-turbo');
  form.append('response_format', 'json');
  form.append('file', new Blob([bytes], { type: contentType }), `command.${format}`);
  const response = await fetcher(GROQ_TRANSCRIPTION_URL, {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}` },
    body: form, signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    const wait = Number(response.headers.get('retry-after'));
    if (response.status === 429) throw new Error(Number.isFinite(wait) && wait > 0
      ? `Groq voice limit reached. Try again in about ${Math.ceil(wait)} seconds.`
      : 'Groq voice limit reached. Check your Groq limits and try again later.');
    throw new Error(`Voice transcription failed (Groq HTTP ${response.status}).`);
  }
  const result = await response.json();
  const transcript = typeof result.text === 'string' ? result.text.trim().slice(0, 1000) : '';
  if (!transcript) throw new Error('No speech was detected. Try again closer to the microphone.');
  return transcript;
}

module.exports = { decodeRecording, transcribeRecording };
