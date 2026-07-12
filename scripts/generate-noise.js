const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION_SECONDS = 300; // 5 minutes per track
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SECONDS;
const AMPLITUDE = 0.3;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'audio');

function writeWav(filename, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  let offset = 0;
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const val = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    buffer.writeInt16LE(Math.round(val), offset);
    offset += 2;
  }

  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

function generateWhiteNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = (Math.random() * 2 - 1) * AMPLITUDE;
  }
  return samples;
}

function generatePinkNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const b = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    b[0] = 0.99886 * b[0] + white * 0.0555179;
    b[1] = 0.99332 * b[1] + white * 0.0750759;
    b[2] = 0.96900 * b[2] + white * 0.1538520;
    b[3] = 0.86650 * b[3] + white * 0.3104856;
    b[4] = 0.55000 * b[4] + white * 0.5329522;
    b[5] = -0.7616 * b[5] - white * 0.0168980;
    samples[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362) * 0.11 * AMPLITUDE;
    b[6] = white * 0.115926;
  }
  return samples;
}

function generateBrownNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  let lastOut = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + (0.02 * white)) / 1.01;
    samples[i] = lastOut * 2.5 * AMPLITUDE;
  }
  return samples;
}

function generateRainNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const buffer = new Float32Array(100);
  for (let i = 0; i < 100; i++) buffer[i] = Math.random() * 2 - 1;
  let pos = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    buffer[pos] = white;
    let sum = 0;
    for (let j = 0; j < 100; j++) sum += buffer[(pos + j) % 100];
    pos = (pos + 1) % 100;
    const filtered = sum / 100;
    const mod = 1 - Math.sin(i / SAMPLE_RATE * Math.PI * 0.5) * 0.15;
    const crackle = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.5 : 0;
    samples[i] = (filtered * 0.4 + crackle) * AMPLITUDE * mod;
  }
  return samples;
}

function generateOceanNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  let lastOut = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + (0.008 * white)) / 1.008;
    const swell = Math.sin(i / SAMPLE_RATE * Math.PI * 0.1) * 0.7 +
                  Math.sin(i / SAMPLE_RATE * Math.PI * 0.23) * 0.3;
    const envelope = 0.5 + swell * 0.5;
    samples[i] = lastOut * 3.0 * envelope * AMPLITUDE;
  }
  return samples;
}

function generateWindNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const b = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    b[0] = 0.99886 * b[0] + white * 0.0555179;
    b[1] = 0.99332 * b[1] + white * 0.0750759;
    b[2] = 0.96900 * b[2] + white * 0.1538520;
    b[3] = 0.86650 * b[3] + white * 0.3104856;
    b[4] = 0.55000 * b[4] + white * 0.5329522;
    b[5] = -0.7616 * b[5] - white * 0.0168980;
    const pink = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362) * 0.11;
    b[6] = white * 0.115926;
    const gust = Math.sin(i / SAMPLE_RATE * Math.PI * 0.03) * 0.5 + 0.5;
    const flutter = Math.sin(i / SAMPLE_RATE * Math.PI * 0.9) * 0.2;
    const envelope = 0.3 + gust * 0.5 + flutter;
    samples[i] = pink * envelope * AMPLITUDE;
  }
  return samples;
}

function generateFanNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const b = [0, 0, 0, 0];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    b[0] = 0.9 * b[0] + white * 0.1;
    b[1] = 0.95 * b[1] + white * 0.05;
    b[2] = 0.98 * b[2] + b[0] * 0.02;
    b[3] = 0.97 * b[3] + b[1] * 0.03;
    const wobble = Math.sin(i / SAMPLE_RATE * Math.PI * 0.15) * 0.12;
    const envelope = 0.7 + wobble;
    samples[i] = (b[2] + b[3]) * 0.5 * envelope * AMPLITUDE * 0.6;
  }
  return samples;
}

function generateThunderstormNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  let lastOut = 0;
  let thunderTimer = 0;
  let thunderActive = false;
  let thunderSample = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + (0.02 * white)) / 1.01;
    let rain = lastOut * 2.5 * AMPLITUDE * 0.5;
    thunderTimer--;
    if (thunderTimer <= 0 && !thunderActive) {
      if (Math.random() < 0.001) {
        thunderActive = true;
        thunderSample = 200 + Math.floor(Math.random() * 1200);
      }
      if (thunderTimer <= -5000) thunderTimer = 0;
    }
    if (thunderActive) {
      const rumble = Math.random() * 2 - 1;
      const lowPass = (thunderSample > 0) ? (lastOut * 0.3 + rumble * 0.05) : 0;
      const phase = 1 - thunderSample / 1200;
      const envelope = Math.sin(phase * Math.PI) * 0.8;
      rain += lowPass * envelope * AMPLITUDE * 0.8;
      thunderSample--;
      if (thunderSample <= 0) thunderActive = false;
    }
    samples[i] = Math.max(-1, Math.min(1, rain));
  }
  return samples;
}

function generateCampfireNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const b = [0, 0, 0, 0, 0, 0, 0];
  let crackleTimer = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    b[0] = 0.99886 * b[0] + white * 0.0555179;
    b[1] = 0.99332 * b[1] + white * 0.0750759;
    b[2] = 0.96900 * b[2] + white * 0.1538520;
    b[3] = 0.86650 * b[3] + white * 0.3104856;
    b[4] = 0.55000 * b[4] + white * 0.5329522;
    b[5] = -0.7616 * b[5] - white * 0.0168980;
    const pink = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362) * 0.11;
    b[6] = white * 0.115926;
    const highFreq = Math.sin(i * 0.5) * 0.3 + Math.sin(i * 0.13) * 0.2;
    const lowRumble = Math.sin(i / SAMPLE_RATE * Math.PI * 0.5) * 0.3;
    const envelope = 0.4 + lowRumble;
    let crackle = 0;
    crackleTimer--;
    if (crackleTimer <= 0) {
      if (Math.random() < 0.008) {
        crackle = (Math.random() * 2 - 1) * 0.6;
        crackleTimer = 2 + Math.floor(Math.random() * 4);
      }
      if (crackleTimer < -50) crackleTimer = 0;
    }
    samples[i] = (pink * 0.4 + highFreq * 0.15 + crackle) * envelope * AMPLITUDE;
  }
  return samples;
}

function generateCricketsNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  let chirpTimer = 0;
  let chirpPhase = 0;
  let isChirping = false;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    let s = 0;
    chirpTimer--;
    if (chirpTimer <= 0 && !isChirping) {
      if (Math.random() < 0.003) {
        isChirping = true;
        chirpPhase = 0;
      }
      if (chirpTimer < -200) chirpTimer = 0;
    }
    if (isChirping) {
      const freq = 4600 + Math.sin(chirpPhase * 0.01) * 400;
      const tone = Math.sin(chirpPhase * freq / SAMPLE_RATE * Math.PI * 2);
      const env = Math.sin(chirpPhase / 120 * Math.PI);
      s = tone * env * 0.25;
      chirpPhase++;
      if (chirpPhase > 120) {
        isChirping = false;
        chirpTimer = 80 + Math.floor(Math.random() * 160);
      }
    }
    const crickets2 = Math.sin(i * 0.023) * 0.03 + Math.sin(i * 0.047) * 0.02;
    samples[i] = (s + crickets2) * AMPLITUDE * 0.7;
  }
  return samples;
}

function generateWaterfallNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const buf = new Float32Array(400);
  for (let i = 0; i < 400; i++) buf[i] = Math.random() * 2 - 1;
  let pos = 0;
  let lastOut = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    buf[pos] = white;
    let sum = 0;
    for (let j = 0; j < 400; j++) sum += buf[(pos + j) % 400];
    pos = (pos + 1) % 400;
    const filtered = sum / 400;
    const low = (lastOut + (0.01 * white)) / 1.01;
    lastOut = low;
    const modulation = Math.sin(i / SAMPLE_RATE * Math.PI * 0.2) * 0.1;
    const envelope = 0.8 + modulation;
    samples[i] = (filtered * 0.6 + low * 0.4) * envelope * AMPLITUDE;
  }
  return samples;
}

function generateHeartbeatNoise() {
  const samples = new Float32Array(NUM_SAMPLES);
  const bpm = 72;
  const beatInterval = Math.floor(SAMPLE_RATE * 60 / bpm);
  const lubDuration = Math.floor(0.12 * SAMPLE_RATE);
  const dubDuration = Math.floor(0.08 * SAMPLE_RATE);
  const dubDelay = Math.floor(0.2 * SAMPLE_RATE);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const beatPos = i % beatInterval;
    let s = 0;
    if (beatPos < lubDuration) {
      const t = beatPos / lubDuration;
      const freq = 40 + (1 - t) * 30;
      s = Math.sin(beatPos * freq / SAMPLE_RATE * Math.PI * 2) * (1 - t) * 0.4;
      s += Math.sin(beatPos * (freq * 2) / SAMPLE_RATE * Math.PI * 2) * (1 - t) * 0.15;
    }
    if (beatPos >= dubDelay && beatPos < dubDelay + dubDuration) {
      const t = (beatPos - dubDelay) / dubDuration;
      const freq = 35 + (1 - t) * 25;
      s += Math.sin((beatPos - dubDelay) * freq / SAMPLE_RATE * Math.PI * 2) * (1 - t) * 0.3;
      s += Math.sin((beatPos - dubDelay) * (freq * 2.5) / SAMPLE_RATE * Math.PI * 2) * (1 - t) * 0.1;
    }
    const noise = (Math.random() * 2 - 1) * 0.02;
    samples[i] = (s + noise) * AMPLITUDE * 1.2;
  }
  return samples;
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Generating noise files...');
writeWav('white-noise.wav', generateWhiteNoise());
writeWav('pink-noise.wav', generatePinkNoise());
writeWav('brown-noise.wav', generateBrownNoise());
writeWav('rain.wav', generateRainNoise());
writeWav('ocean.wav', generateOceanNoise());
writeWav('wind.wav', generateWindNoise());
writeWav('fan.wav', generateFanNoise());
writeWav('thunderstorm.wav', generateThunderstormNoise());
writeWav('campfire.wav', generateCampfireNoise());
writeWav('crickets.wav', generateCricketsNoise());
writeWav('waterfall.wav', generateWaterfallNoise());
writeWav('heartbeat.wav', generateHeartbeatNoise());
console.log('Done!');
