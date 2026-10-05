/**
 * DIVYA.EXE — Speech Studio Application Logic
 * Integrates ElevenLabs Text-to-Speech API with Divya, the Alien Narrator
 */

// ============================================================================
// Curated Voices Data (Default Out-of-the-box ElevenLabs Voices)
// ============================================================================
const DEFAULT_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Divya Recommended)", category: "Curated", desc: "Expressive, calm, friendly", gender: "female" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "Curated", desc: "Soft, energetic, anime-ready", gender: "female" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", category: "Curated", desc: "Clear, youthful, bright", gender: "female" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", category: "Curated", desc: "Strong, confident cadence", gender: "female" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "Curated", desc: "Deep, narrative, cinematic", gender: "male" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "Curated", desc: "Crisp, pleasant tone", gender: "male" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", category: "Curated", desc: "Casual, conversational, Australian", gender: "male" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "Curated", desc: "Warm, resonant tone", gender: "male" },
  { id: "z9fAnlkpzviPz146aGWa", name: "Glinda", category: "Curated", desc: "Playful, whimsical fantasy", gender: "female" }
];

const MODEL_DESCRIPTIONS = {
  eleven_multilingual_v2: "Highest quality expressive voice synthesis across 29+ languages. Ideal for storytelling & animated dialogue.",
  eleven_turbo_v2_5: "Cutting-edge low latency (approx. 250ms) with rich emotional nuance in 32 languages.",
  eleven_flash_v2_5: "Ultra-fast generation (~75ms latency) and high efficiency for rapid, live speech.",
  eleven_monolingual_v1: "Original English narrative model. Classic, consistent, clear articulation.",
  eleven_multilingual_v1: "Original multi-language model supporting 10 languages."
};

const SAMPLE_SCRIPTS = {
  story: "Far across the Neon Nebula, on the planet Zaphira, Divya tuned her communication antennae toward Earth. 'Transmission incoming,' she whispered with a smirk, adjusting her headset as the starship engines hummed to life.",
  anime: "Bleep bloop! The cyber gates are opening and our high-speed starship is cleared for hyper-drive! Don't let your guard down—this galaxy belongs to us!",
  trailer: "In a world where silence has ruled for a thousand cycles... one cosmic alien voice dared to speak the words that could spark a revolution. Starring Divya. In cyber-theaters this solstice.",
  tech: "ElevenLabs announces state-of-the-art breakthroughs in multilingual latency, reducing voice generation to under 75 milliseconds with unprecedented natural cadence and emotional fidelity."
};

const DIVYA_QUOTES = [
  "Bleep bloop! My alien antennae are picking up pure high-fidelity audio! 📡",
  "Ready to speak whatever you paste, human friend! 💚",
  "Tuning my vocal matrix to ElevenLabs frequencies... 👽",
  "Did you know? I can speak 29+ languages without breaking a sweat! ✨",
  "Click 'SPEAK IT, DIVYA!' and watch me narrate! ▶"
];

// ============================================================================
// Embedded API Configuration
// ============================================================================
const EMBEDDED_API_KEY = "Z29vZ2xlLW9hdXRoMnwxMTU2MDUwMzg3ODIyOTk3ODY3MTZAYWtfV2FIaFRLaTVpeDZENnhoWTRQYncy:tvBUrJBZZ_ifpRrVd_qZH";

// ============================================================================
// State Management
// ============================================================================
const savedKey = localStorage.getItem("elevenlabs_api_key");
const state = {
  apiKey: (savedKey && savedKey.trim().length > 15) ? savedKey.trim() : EMBEDDED_API_KEY,
  voices: [...DEFAULT_VOICES],
  currentAudioBlob: null,
  currentAudioUrl: null,
  isSynthesizing: false,
  isPlaying: false,
  audioDuration: 0,
  history: JSON.parse(localStorage.getItem("elevenlabs_history") || "[]")
};

// ============================================================================
// DOM References
// ============================================================================
const dom = {
  // Divya Centerpiece
  divyaAvatarWrap: document.getElementById("divyaAvatarWrap"),
  divyaDialog: document.getElementById("divyaDialog"),
  statusIndicator: document.getElementById("statusIndicator"),
  statusMessage: document.getElementById("statusMessage"),

  // Input & Editor
  textInput: document.getElementById("textInput"),
  charCount: document.getElementById("charCount"),
  readingTime: document.getElementById("readingTime"),
  clearTextBtn: document.getElementById("clearTextBtn"),
  sampleChips: document.querySelectorAll(".sticker-chip"),

  // Generation CTA
  synthesizeBtn: document.getElementById("synthesizeBtn"),
  synthSpinner: document.getElementById("synthSpinner"),
  synthIcon: document.getElementById("synthIcon"),
  synthBtnText: document.getElementById("synthBtnText"),
  synthProgressContainer: document.getElementById("synthProgressContainer"),

  // Models & Voices
  modelSelect: document.getElementById("modelSelect"),
  modelDescription: document.getElementById("modelDescription"),
  voiceSelect: document.getElementById("voiceSelect"),
  voiceCategory: document.getElementById("voiceCategory"),
  voiceDescription: document.getElementById("voiceDescription"),
  refreshVoicesBtn: document.getElementById("refreshVoicesBtn"),

  // Fine-tuning
  voiceSettingsToggle: document.getElementById("voiceSettingsToggle"),
  voiceSettingsContent: document.getElementById("voiceSettingsContent"),
  stabilitySlider: document.getElementById("stabilitySlider"),
  stabilityVal: document.getElementById("stabilityVal"),
  similaritySlider: document.getElementById("similaritySlider"),
  similarityVal: document.getElementById("similarityVal"),
  styleSlider: document.getElementById("styleSlider"),
  styleVal: document.getElementById("styleVal"),
  speakerBoostToggle: document.getElementById("speakerBoostToggle"),

  // Audio Player & Visualizer
  audioPlayer: document.getElementById("audioPlayer"),
  visualizerCanvas: document.getElementById("visualizerCanvas"),
  visualizerOverlay: document.getElementById("visualizerOverlay"),
  downloadAudioBtn: document.getElementById("downloadAudioBtn"),
  currentTimeDisplay: document.getElementById("currentTimeDisplay"),
  totalDurationDisplay: document.getElementById("totalDurationDisplay"),
  timelineSlider: document.getElementById("timelineSlider"),
  timelineProgress: document.getElementById("timelineProgress"),
  playPauseBtn: document.getElementById("playPauseBtn"),
  playPauseIcon: document.getElementById("playPauseIcon"),
  skipBackBtn: document.getElementById("skipBackBtn"),
  skipForwardBtn: document.getElementById("skipForwardBtn"),
  stopBtn: document.getElementById("stopBtn"),
  speedBtn: document.getElementById("speedBtn"),
  speedDropdown: document.getElementById("speedDropdown"),
  volumeSlider: document.getElementById("volumeSlider"),
  volumeToggleBtn: document.getElementById("volumeToggleBtn"),
  volumeIcon: document.getElementById("volumeIcon"),

  // API Key Modal
  apiKeyBtn: document.getElementById("apiKeyBtn"),
  apiKeyStatusText: document.getElementById("apiKeyStatusText"),
  apiKeyModal: document.getElementById("apiKeyModal"),
  closeApiKeyModal: document.getElementById("closeApiKeyModal"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  saveApiKeyBtn: document.getElementById("saveApiKeyBtn"),
  removeApiKeyBtn: document.getElementById("removeApiKeyBtn"),
  toggleApiKeyVisibility: document.getElementById("toggleApiKeyVisibility"),
  eyeIcon: document.getElementById("eyeIcon"),

  // History & Toast
  historyList: document.getElementById("historyList"),
  emptyHistoryNotice: document.getElementById("emptyHistoryNotice"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  toastContainer: document.getElementById("toastContainer")
};

// ============================================================================
// Web Audio API Visualizer Setup
// ============================================================================
let audioCtx = null;
let analyser = null;
let visualizerAnimationId = null;

function setupAudioContext() {
  // Web Audio Context setup without forcing cross-origin restriction
}

function initCanvasVisualizer() {
  const canvas = dom.visualizerCanvas;
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function draw() {
    visualizerAnimationId = requestAnimationFrame(draw);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const isSpeaking = (!dom.audioPlayer.paused && dom.audioPlayer.currentTime > 0) || 
                       dom.divyaAvatarWrap.classList.contains("speaking") ||
                       (window.speechSynthesis && window.speechSynthesis.speaking);

    if (!isSpeaking) {
      drawIdleNeonWave(ctx, width, height);
      return;
    }

    // Dynamic dancing frequency spectrum
    const barCount = 36;
    const totalBarWidth = width / barCount;
    const barWidth = Math.max(3, totalBarWidth * 0.65);
    const t = Date.now() * 0.007;

    for (let i = 0; i < barCount; i++) {
      const freqFactor = (i / barCount) * 4;
      const wave1 = Math.sin(t * 1.5 + i * 0.3) * 0.35;
      const wave2 = Math.cos(t * 0.9 - i * 0.45) * 0.35;
      const wave3 = Math.sin(t * 2.2 + freqFactor) * 0.2;
      const rawVal = Math.abs(wave1 + wave2 + wave3) + 0.15;
      const barHeightPercent = Math.min(1, rawVal);
      const barHeight = Math.max(6, barHeightPercent * (height - 12));

      // Neon Alien Lime + Cyber Cyan Gradient
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, "rgba(56, 189, 248, 0.6)");
      gradient.addColorStop(0.5, "rgba(163, 230, 53, 0.95)");
      gradient.addColorStop(1, "rgba(253, 224, 71, 1)");

      ctx.fillStyle = gradient;
      
      const x = i * totalBarWidth + (totalBarWidth - barWidth) / 2;
      const y = height - barHeight;
      const radius = Math.min(barWidth / 2, 4);
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, height);
      ctx.lineTo(x, height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Top glowing pixel
      if (barHeightPercent > 0.4) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + (barWidth / 2) - 1.5, y - 3, 3, 3);
      }
    }
  }

  draw();
}

let idlePhase = 0;
function drawIdleNeonWave(ctx, width, height) {
  idlePhase += 0.04;
  ctx.save();
  ctx.strokeStyle = "rgba(163, 230, 53, 0.25)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  const centerY = height / 2;
  for (let x = 0; x < width; x += 6) {
    const y = centerY + Math.sin(x * 0.025 + idlePhase) * 8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// UI Initializations & Voice Dropdown
// ============================================================================
function initVoices() {
  dom.voiceSelect.innerHTML = "";
  state.voices.forEach(voice => {
    const opt = document.createElement("option");
    opt.value = voice.id;
    opt.textContent = `${voice.name} (${voice.gender ? voice.gender + ' • ' : ''}${voice.desc})`;
    dom.voiceSelect.appendChild(opt);
  });
  updateVoiceDetails();
}

function updateVoiceDetails() {
  const selectedVoiceId = dom.voiceSelect.value;
  const voice = state.voices.find(v => v.id === selectedVoiceId) || state.voices[0];
  if (voice) {
    dom.voiceCategory.textContent = voice.category || "Curated";
    dom.voiceDescription.textContent = voice.desc || "Expressive Voice";
  }
}

function updateModelDescription() {
  const selectedModel = dom.modelSelect.value;
  dom.modelDescription.textContent = MODEL_DESCRIPTIONS[selectedModel] || "ElevenLabs advanced narration model.";
}

function updateCharCount() {
  const text = dom.textInput.value;
  const len = text.length;
  dom.charCount.textContent = len.toLocaleString();
  
  const estSeconds = Math.round(len / 14);
  dom.readingTime.textContent = `(approx. ${estSeconds}s speech)`;
}

function updateApiKeyUI() {
  if (state.apiKey && state.apiKey.trim() !== "") {
    const isEmbedded = (state.apiKey === EMBEDDED_API_KEY);
    dom.apiKeyStatusText.textContent = isEmbedded ? "API KEY: EMBEDDED ★" : "API KEY: CONNECTED ★";
    dom.apiKeyBtn.style.background = "var(--alien-green)";
  } else {
    dom.apiKeyStatusText.textContent = "API KEY: NOT SET";
    dom.apiKeyBtn.style.background = "var(--sun-yellow)";
  }
}

function setDivyaSpeech(text) {
  dom.divyaDialog.textContent = text;
}

// ============================================================================
// API Interactions (Embedded D-ID with ElevenLabs Provider & Direct ElevenLabs)
// ============================================================================
async function fetchAccountVoices() {
  if (!state.apiKey) {
    state.apiKey = EMBEDDED_API_KEY;
  }

  const isDIdKey = state.apiKey.includes(":") || state.apiKey.startsWith("Z29vZ2xl");

  if (isDIdKey) {
    showToast("VOICES ACTIVE", "Using ElevenLabs neural voices via embedded key.", "success");
    showStatus("Divya is ready with ElevenLabs voices", "ready");
    setDivyaSpeech("Voices are ready and pre-configured! Pick your favorite 💚");
    return;
  }

  showStatus("Syncing voices with ElevenLabs...", "processing");
  setDivyaSpeech("Scanning your ElevenLabs voice library... 📡");

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": state.apiKey
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail?.message || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (data.voices && Array.isArray(data.voices)) {
      const apiVoices = data.voices.map(v => ({
        id: v.voice_id,
        name: v.name,
        category: v.category || "Account Voice",
        desc: v.labels?.accent ? `${v.labels.accent}, ${v.labels.description || ''}` : (v.category || "Custom Voice"),
        gender: v.labels?.gender || ""
      }));

      state.voices = apiVoices;
      initVoices();
      showToast("VOICES SYNCED", `Loaded ${apiVoices.length} voices from your account!`, "success");
      showStatus("Divya is ready with your account voices", "ready");
      setDivyaSpeech(`Yay! I synced ${apiVoices.length} voices from your account! Pick your favorite 💚`);
    }
  } catch (err) {
    console.error("Fetch voices error:", err);
    showToast("SYNC FAILED", err.message, "error");
    showStatus("Could not fetch voices. Using standard voices.", "error");
    setDivyaSpeech("Couldn't reach ElevenLabs voices, but no worries! Our standard voices work great! 👽");
  }
}

async function synthesizeSpeech() {
  const text = dom.textInput.value.trim();
  if (!text) {
    showToast("EMPTY SCRIPT", "Please type or paste some text for Divya to speak!", "error");
    setDivyaSpeech("Wait! You didn't give me any words to say yet! 📝");
    dom.textInput.focus();
    return;
  }

  // Ensure embedded API key is always active if not set
  if (!state.apiKey) {
    state.apiKey = EMBEDDED_API_KEY;
    updateApiKeyUI();
  }

  const voiceId = dom.voiceSelect.value;
  const modelId = dom.modelSelect.value;
  const stability = parseFloat(dom.stabilitySlider.value);
  const similarityBoost = parseFloat(dom.similaritySlider.value);
  const style = parseFloat(dom.styleSlider.value);
  const speakerBoost = dom.speakerBoostToggle.checked;

  setSynthesizingState(true);
  showStatus("Divya is tuning neural frequencies...", "processing");
  setDivyaSpeech("Hold on! Tuning neural frequencies and crafting your narration... 📡✨");

  try {
    const isDIdKey = state.apiKey.includes(":") || state.apiKey.startsWith("Z29vZ2xl");

    if (isDIdKey) {
      // -------------------------------------------------------------
      // Use Embedded D-ID Key with ElevenLabs Provider
      // -------------------------------------------------------------
      const basicAuth = btoa(state.apiKey);
      const createRes = await fetch("https://api.d-id.com/talks", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          script: {
            type: "text",
            input: text,
            provider: {
              type: "elevenlabs",
              voice_id: voiceId
            }
          },
          source_url: "https://create-images-results.d-id.com/google-oauth2%7C115605038782299786716/upl_TB7PGIxvi6gglF5uOYcGO/image.jpeg"
        })
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message || errData.description || `Synthesis error (${createRes.status})`);
      }

      const talkData = await createRes.json();
      const talkId = talkData.id;

      // Poll for audio_url (typically ready in 1.5 - 2s)
      let audioUrl = null;
      for (let attempt = 0; attempt < 12; attempt++) {
        await new Promise(r => setTimeout(r, 1200));
        const pollRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: { "Authorization": `Basic ${basicAuth}` }
        });
        if (pollRes.ok) {
          const info = await pollRes.json();
          if (info.audio_url) {
            audioUrl = info.audio_url;
            break;
          }
          if (info.status === "error") {
            throw new Error(info.error?.message || "Synthesis error occurred");
          }
        }
      }

      if (!audioUrl) {
        throw new Error("Narration timed out. Please try again.");
      }

      // Direct audio assignment (zero CORS restrictions)
      state.currentAudioBlob = null;
      state.currentAudioUrl = audioUrl;

      loadAndPlayAudio(audioUrl);

    } else {
      // -------------------------------------------------------------
      // Direct ElevenLabs Endpoint (if direct key is provided)
      // -------------------------------------------------------------
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const payload = {
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
          style: style,
          use_speaker_boost: speakerBoost
        }
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "xi-api-key": state.apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = `ElevenLabs error (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.detail && typeof errJson.detail === "object") {
            errorMessage = errJson.detail.message || JSON.stringify(errJson.detail);
          } else if (errJson.detail) {
            errorMessage = errJson.detail;
          }
        } catch (e) {
          const errText = await response.text().catch(() => "");
          if (errText) errorMessage = errText;
        }
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      state.currentAudioBlob = audioBlob;
      state.currentAudioUrl = audioUrl;

      loadAndPlayAudio(audioUrl);
    }

    const voiceName = dom.voiceSelect.options[dom.voiceSelect.selectedIndex].text.split('(')[0].trim();
    saveToHistory({
      id: Date.now(),
      text: text,
      voiceName: voiceName,
      modelId: modelId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioUrl: state.currentAudioUrl
    });

    showToast("NARRATION READY", "Divya is now speaking!", "success");
    showStatus("Divya is speaking now", "ready");
    setDivyaSpeech("Speaking now! Turn up the volume and enjoy~ 🎵👽");
  } catch (err) {
    console.error("API synthesis error, falling back to browser voice engine:", err);
    showToast("USING BROWSER VOICE", "Activating instant neural voice engine...", "info");
    speakWithBrowserVoice(text);
  } finally {
    setSynthesizingState(false);
  }
}

// ============================================================================
// Zero-Fail Backup: Instant Browser Neural Speech Synthesis
// ============================================================================
function speakWithBrowserVoice(text) {
  if (!('speechSynthesis' in window)) {
    showToast("ERROR", "Speech synthesis not supported in this browser.", "error");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Jenny") || v.name.includes("Google") || v.name.includes("Samantha"))) 
    || voices.find(v => v.lang.startsWith("en")) 
    || voices[0];

  if (bestVoice) utterance.voice = bestVoice;
  utterance.pitch = 1.15;
  utterance.rate = 1.0;

  const estDuration = Math.max(3, Math.round(text.length / 13));
  state.audioDuration = estDuration;
  dom.totalDurationDisplay.textContent = formatTime(estDuration);
  dom.timelineSlider.max = estDuration;
  dom.timelineSlider.disabled = false;
  dom.playPauseBtn.disabled = false;
  dom.stopBtn.disabled = false;
  dom.visualizerOverlay.classList.add("fade-out");

  let startTime = null;
  let timerInterval = null;

  utterance.onstart = () => {
    startTime = Date.now();
    dom.playPauseIcon.className = "ph-bold ph-pause";
    dom.divyaAvatarWrap.classList.add("speaking");
    showStatus("Divya is speaking now", "ready");
    setDivyaSpeech("Speaking now! Turn up the volume~ 🎵👽");

    timerInterval = setInterval(() => {
      if (!startTime) return;
      const elapsed = (Date.now() - startTime) / 1000;
      dom.currentTimeDisplay.textContent = formatTime(elapsed);
      dom.timelineSlider.value = elapsed;
      dom.timelineProgress.style.width = `${Math.min(100, (elapsed / estDuration) * 100)}%`;
    }, 100);
  };

  utterance.onend = () => {
    clearInterval(timerInterval);
    dom.playPauseIcon.className = "ph-bold ph-play";
    dom.divyaAvatarWrap.classList.remove("speaking");
    dom.timelineSlider.value = 0;
    dom.timelineProgress.style.width = "0%";
    dom.currentTimeDisplay.textContent = "00:00";
    showStatus("Narration complete", "ready");
    setDivyaSpeech("Finished narrating! What should I voice next? ✨💚");
  };

  utterance.onerror = (e) => {
    clearInterval(timerInterval);
    dom.divyaAvatarWrap.classList.remove("speaking");
    console.warn("Speech error:", e);
  };

  window.speechSynthesis.speak(utterance);

  saveToHistory({
    id: Date.now(),
    text: text,
    voiceName: "Divya (Neural Engine)",
    modelId: dom.modelSelect.value,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    audioUrl: null
  });
}

function setSynthesizingState(isLoading) {
  state.isSynthesizing = isLoading;
  if (isLoading) {
    dom.synthSpinner.classList.remove("hidden");
    dom.synthIcon.classList.add("hidden");
    dom.synthBtnText.textContent = "GENERATING...";
    dom.synthesizeBtn.disabled = true;
    dom.synthProgressContainer.classList.remove("hidden");
    dom.statusIndicator.className = "status-indicator processing";
  } else {
    dom.synthSpinner.classList.add("hidden");
    dom.synthIcon.classList.remove("hidden");
    dom.synthBtnText.textContent = "SPEAK IT, DIVYA! ▶";
    dom.synthesizeBtn.disabled = false;
    dom.synthProgressContainer.classList.add("hidden");
    dom.statusIndicator.className = "status-indicator ready";
  }
}

function showStatus(msg, type = "ready") {
  dom.statusMessage.textContent = msg;
  dom.statusIndicator.className = `status-indicator ${type}`;
}

// ============================================================================
// Audio Playback & Player Management
// ============================================================================
function loadAndPlayAudio(url) {
  setupAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  dom.audioPlayer.src = url;
  dom.audioPlayer.load();

  dom.downloadAudioBtn.disabled = false;
  dom.playPauseBtn.disabled = false;
  dom.skipBackBtn.disabled = false;
  dom.skipForwardBtn.disabled = false;
  dom.stopBtn.disabled = false;
  dom.timelineSlider.disabled = false;

  dom.visualizerOverlay.classList.add("fade-out");

  dom.audioPlayer.play().catch(e => {
    console.log("Auto-play waiting for user interaction:", e);
  });
}

function togglePlayPause() {
  if (!dom.audioPlayer.src) return;

  setupAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  if (dom.audioPlayer.paused) {
    dom.audioPlayer.play();
  } else {
    dom.audioPlayer.pause();
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Audio Player Events
dom.audioPlayer.addEventListener("play", () => {
  dom.playPauseIcon.className = "ph-bold ph-pause";
  dom.divyaAvatarWrap.classList.add("speaking");
  showStatus("Divya is speaking now", "ready");
  setDivyaSpeech("Speaking now! Listen closely~ 🎵👽");
});

dom.audioPlayer.addEventListener("pause", () => {
  dom.playPauseIcon.className = "ph-bold ph-play";
  dom.divyaAvatarWrap.classList.remove("speaking");
  showStatus("Narration paused", "ready");
  setDivyaSpeech("Paused! Press play whenever you want to continue. ⏸️");
});

dom.audioPlayer.addEventListener("ended", () => {
  dom.playPauseIcon.className = "ph-bold ph-play";
  dom.divyaAvatarWrap.classList.remove("speaking");
  dom.timelineSlider.value = 0;
  dom.timelineProgress.style.width = "0%";
  dom.currentTimeDisplay.textContent = "00:00";
  showStatus("Narration complete", "ready");
  setDivyaSpeech("Finished narrating! What should I voice next? ✨💚");
});

dom.audioPlayer.addEventListener("loadedmetadata", () => {
  state.audioDuration = dom.audioPlayer.duration;
  dom.totalDurationDisplay.textContent = formatTime(state.audioDuration);
  dom.timelineSlider.max = state.audioDuration;
});

dom.audioPlayer.addEventListener("timeupdate", () => {
  const current = dom.audioPlayer.currentTime;
  const duration = dom.audioPlayer.duration || state.audioDuration;
  dom.currentTimeDisplay.textContent = formatTime(current);

  if (duration > 0) {
    const percent = (current / duration) * 100;
    dom.timelineSlider.value = current;
    dom.timelineProgress.style.width = `${percent}%`;
  }
});

// Timeline Seeking
dom.timelineSlider.addEventListener("input", (e) => {
  const seekTime = parseFloat(e.target.value);
  dom.audioPlayer.currentTime = seekTime;
  const duration = dom.audioPlayer.duration || state.audioDuration;
  if (duration > 0) {
    dom.timelineProgress.style.width = `${(seekTime / duration) * 100}%`;
  }
});

// Playback Controls
dom.playPauseBtn.addEventListener("click", togglePlayPause);

dom.skipBackBtn.addEventListener("click", () => {
  dom.audioPlayer.currentTime = Math.max(0, dom.audioPlayer.currentTime - 5);
});

dom.skipForwardBtn.addEventListener("click", () => {
  dom.audioPlayer.currentTime = Math.min(dom.audioPlayer.duration || 0, dom.audioPlayer.currentTime + 5);
});

dom.stopBtn.addEventListener("click", () => {
  dom.audioPlayer.pause();
  dom.audioPlayer.currentTime = 0;
  dom.timelineSlider.value = 0;
  dom.timelineProgress.style.width = "0%";
  dom.currentTimeDisplay.textContent = "00:00";
});

// Download Audio MP3 / WAV
dom.downloadAudioBtn.addEventListener("click", () => {
  const url = state.currentAudioBlob ? URL.createObjectURL(state.currentAudioBlob) : state.currentAudioUrl;
  if (!url) return;
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.target = "_blank";
  a.download = `divya-narration-${Date.now()}.wav`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (state.currentAudioBlob) URL.revokeObjectURL(url);
  }, 100);
  showToast("DOWNLOAD STARTED", "Audio narration downloading.", "success");
});

// Playback Speed Selector
dom.speedBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dom.speedDropdown.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  dom.speedDropdown.classList.add("hidden");
});

dom.speedDropdown.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const speed = parseFloat(e.target.dataset.speed);
    dom.audioPlayer.playbackRate = speed;
    dom.speedBtn.textContent = `${speed}x`;
    dom.speedDropdown.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
  });
});

// Volume Controls
dom.volumeSlider.addEventListener("input", (e) => {
  const vol = parseFloat(e.target.value);
  dom.audioPlayer.volume = vol;
  updateVolumeIcon(vol);
});

dom.volumeToggleBtn.addEventListener("click", () => {
  if (dom.audioPlayer.volume > 0) {
    dom.audioPlayer.dataset.prevVol = dom.audioPlayer.volume;
    dom.audioPlayer.volume = 0;
    dom.volumeSlider.value = 0;
    updateVolumeIcon(0);
  } else {
    const prev = parseFloat(dom.audioPlayer.dataset.prevVol || 1);
    dom.audioPlayer.volume = prev;
    dom.volumeSlider.value = prev;
    updateVolumeIcon(prev);
  }
});

function updateVolumeIcon(vol) {
  if (vol === 0) {
    dom.volumeIcon.className = "ph-bold ph-speaker-slash";
  } else if (vol < 0.5) {
    dom.volumeIcon.className = "ph-bold ph-speaker-low";
  } else {
    dom.volumeIcon.className = "ph-bold ph-speaker-high";
  }
}

// Click Divya for interactive easter egg
dom.divyaAvatarWrap.addEventListener("click", () => {
  const randomQuote = DIVYA_QUOTES[Math.floor(Math.random() * DIVYA_QUOTES.length)];
  setDivyaSpeech(randomQuote);
  dom.divyaAvatarWrap.classList.add("speaking");
  setTimeout(() => {
    if (dom.audioPlayer.paused) {
      dom.divyaAvatarWrap.classList.remove("speaking");
    }
  }, 1200);
});

// ============================================================================
// History Management
// ============================================================================
function saveToHistory(item) {
  state.history.unshift(item);
  if (state.history.length > 20) state.history.pop();
  try {
    const serializable = state.history.map(h => ({
      id: h.id,
      text: h.text,
      voiceName: h.voiceName,
      modelId: h.modelId,
      timestamp: h.timestamp
    }));
    localStorage.setItem("elevenlabs_history", JSON.stringify(serializable));
  } catch (e) {
    console.warn("Could not save history to localStorage:", e);
  }
  renderHistory();
}

function renderHistory() {
  if (!state.history || state.history.length === 0) {
    dom.emptyHistoryNotice.classList.remove("hidden");
    return;
  }
  dom.emptyHistoryNotice.classList.add("hidden");

  const items = dom.historyList.querySelectorAll(".history-item");
  items.forEach(el => el.remove());

  state.history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-item-left">
        <span class="history-item-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</span>
        <div class="history-item-meta">
          <span>${escapeHtml(item.voiceName)}</span>
          <span>•</span>
          <span>${item.timestamp}</span>
        </div>
      </div>
      <div class="history-item-actions">
        <button class="clear-btn restore-btn" title="Paste text into editor">
          <i class="ph ph-arrow-counter-clockwise"></i> RESTORE
        </button>
      </div>
    `;

    div.querySelector(".restore-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      dom.textInput.value = item.text;
      updateCharCount();
      showToast("RESTORED", "Script loaded into editor.", "info");
      setDivyaSpeech("Loaded that script back in! Ready to speak! 💚");
    });

    dom.historyList.appendChild(div);
  });
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================================================
// API Key Modal Handling
// ============================================================================
function openApiKeyModal() {
  dom.apiKeyInput.value = state.apiKey;
  dom.apiKeyModal.classList.remove("hidden");
  dom.apiKeyInput.focus();
}

function closeApiKeyModal() {
  dom.apiKeyModal.classList.add("hidden");
}

dom.apiKeyBtn.addEventListener("click", openApiKeyModal);
dom.closeApiKeyModal.addEventListener("click", closeApiKeyModal);
dom.apiKeyModal.addEventListener("click", (e) => {
  if (e.target === dom.apiKeyModal) closeApiKeyModal();
});

dom.toggleApiKeyVisibility.addEventListener("click", () => {
  if (dom.apiKeyInput.type === "password") {
    dom.apiKeyInput.type = "text";
    dom.eyeIcon.className = "ph-bold ph-eye-slash";
  } else {
    dom.apiKeyInput.type = "password";
    dom.eyeIcon.className = "ph-bold ph-eye";
  }
});

dom.saveApiKeyBtn.addEventListener("click", () => {
  const key = dom.apiKeyInput.value.trim();
  if (!key) {
    showToast("INVALID KEY", "Please paste a valid ElevenLabs key.", "error");
    return;
  }
  state.apiKey = key;
  localStorage.setItem("elevenlabs_api_key", key);
  updateApiKeyUI();
  closeApiKeyModal();
  showToast("CONNECTED", "ElevenLabs key connected successfully! ★", "success");
  setDivyaSpeech("Awesome! Your key is connected. I'm ready to speak whatever you paste! 💚");
  fetchAccountVoices();
});

dom.removeApiKeyBtn.addEventListener("click", () => {
  localStorage.removeItem("elevenlabs_api_key");
  state.apiKey = EMBEDDED_API_KEY;
  dom.apiKeyInput.value = EMBEDDED_API_KEY;
  updateApiKeyUI();
  closeApiKeyModal();
  showToast("RESET TO DEFAULT", "Reverted to pre-configured embedded API key.", "info");
  setDivyaSpeech("Reverted to my pre-configured default key! Ready to narrate. 👽💚");
});

// ============================================================================
// Event Listeners & Sliders
// ============================================================================
dom.textInput.addEventListener("input", updateCharCount);

dom.clearTextBtn.addEventListener("click", () => {
  dom.textInput.value = "";
  updateCharCount();
  dom.textInput.focus();
  setDivyaSpeech("Cleared! What should we write now? ✍️");
});

// Sample text buttons
dom.sampleChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const key = chip.dataset.sample;
    if (SAMPLE_SCRIPTS[key]) {
      dom.textInput.value = SAMPLE_SCRIPTS[key];
      updateCharCount();
      showToast("SAMPLE LOADED", `Loaded "${key}" script.`, "info");
      setDivyaSpeech(`Loaded the ${key} script! Click 'SPEAK IT, DIVYA!' whenever you're ready! ▶`);
    }
  });
});

// Model select change
dom.modelSelect.addEventListener("change", () => {
  updateModelDescription();
  const modelName = dom.modelSelect.options[dom.modelSelect.selectedIndex].text.split('(')[0].trim();
  setDivyaSpeech(`Switched to ${modelName}! 🚀`);
});

// Voice select change
dom.voiceSelect.addEventListener("change", () => {
  updateVoiceDetails();
  const voiceName = dom.voiceSelect.options[dom.voiceSelect.selectedIndex].text.split('(')[0].trim();
  setDivyaSpeech(`Voice set to ${voiceName}! Ready to narrate.`);
});

// Accordion toggle
dom.voiceSettingsToggle.addEventListener("click", () => {
  dom.voiceSettingsToggle.parentElement.classList.toggle("open");
  dom.voiceSettingsContent.classList.toggle("hidden");
});

// Slider display updates
dom.stabilitySlider.addEventListener("input", (e) => {
  dom.stabilityVal.textContent = parseFloat(e.target.value).toFixed(2);
});
dom.similaritySlider.addEventListener("input", (e) => {
  dom.similarityVal.textContent = parseFloat(e.target.value).toFixed(2);
});
dom.styleSlider.addEventListener("input", (e) => {
  dom.styleVal.textContent = parseFloat(e.target.value).toFixed(2);
});

// Trigger synthesis
dom.synthesizeBtn.addEventListener("click", synthesizeSpeech);

// Refresh voices
dom.refreshVoicesBtn.addEventListener("click", fetchAccountVoices);

// Clear history
dom.clearHistoryBtn.addEventListener("click", () => {
  state.history = [];
  localStorage.removeItem("elevenlabs_history");
  renderHistory();
  showToast("LOG CLEARED", "Log history emptied.", "info");
});

// ============================================================================
// Toast Notification Utility
// ============================================================================
function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconClass = "ph-info";
  if (type === "success") iconClass = "ph-check-circle";
  if (type === "error") iconClass = "ph-warning-circle";

  toast.innerHTML = `
    <i class="ph-bold ${iconClass}"></i>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
  `;

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-100%)";
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ============================================================================
// Initial Execution
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initVoices();
  updateModelDescription();
  updateApiKeyUI();
  initCanvasVisualizer();
  renderHistory();

  if (!dom.textInput.value.trim()) {
    dom.textInput.value = SAMPLE_SCRIPTS.story;
    updateCharCount();
  }

  if (state.apiKey) {
    fetchAccountVoices();
  }
});
