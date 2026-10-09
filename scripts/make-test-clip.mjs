// Writes test/fixtures/clip.wav: 1 second, 440 Hz sine, 8 kHz mono 16-bit PCM (~16 KB).
// WAV plays in <video> and <audio> on every Chromium build, including Playwright's.
import { writeFile } from 'node:fs/promises';

const sampleRate = 8000;
const seconds = 1;
const samples = sampleRate * seconds;
const dataSize = samples * 2;
const buf = Buffer.alloc(44 + dataSize);

buf.write('RIFF', 0);
buf.writeUInt32LE(36 + dataSize, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); // fmt chunk size
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(1, 22); // mono
buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
buf.writeUInt16LE(2, 32); // block align
buf.writeUInt16LE(16, 34); // bits per sample
buf.write('data', 36);
buf.writeUInt32LE(dataSize, 40);

for (let i = 0; i < samples; i++) {
  const value = Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.2 * 32767);
  buf.writeInt16LE(value, 44 + i * 2);
}

await writeFile('test/fixtures/clip.wav', buf);
console.log('Wrote test/fixtures/clip.wav');
