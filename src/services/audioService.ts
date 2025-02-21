import type { Note } from '../types/music';

class AudioService {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private currentNoteIndex = 0;
  private scheduledNotes: any[] = [];

  // 音高到频率的映射（C4 = 中央C）
  private readonly noteFrequencies: Record<string, number> = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
    // 其他八度
    'C3': 130.81,
    'D3': 146.83,
    'E3': 164.81,
    'F3': 174.61,
    'G3': 196.00,
    'A3': 220.00,
    'B3': 246.94,
    'C5': 523.25,
    'D5': 587.33,
    'E5': 659.26,
    'F5': 698.46,
    'G5': 783.99,
    'A5': 880.00,
    'B5': 987.77,
  };

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    this.audioContext = new AudioContext();
  }

  private getNoteFrequency(note: Note): number {
    const noteKey = `${note.pitch}${note.octave}`;
    let frequency = this.noteFrequencies[noteKey];

    // 处理临时记号
    if (note.accidental === 'sharp') {
      frequency *= Math.pow(2, 1/12); // 升半音
    } else if (note.accidental === 'flat') {
      frequency /= Math.pow(2, 1/12); // 降半音
    }

    return frequency;
  }

  private getNoteDuration(note: Note, tempo: number): number {
    const beatDuration = 60 / tempo; // 一拍的时长（秒）
    let duration = 0;

    switch (note.duration) {
      case '1':
        duration = beatDuration * 4;
        break;
      case '1/2':
        duration = beatDuration * 2;
        break;
      case '1/4':
        duration = beatDuration;
        break;
      case '1/8':
        duration = beatDuration / 2;
        break;
    }

    // 处理附点音符
    if (note.dotted) {
      duration *= 1.5;
    }

    return duration;
  }

  private async playNote(note: Note, tempo: number, time: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const frequency = this.getNoteFrequency(note);
    const duration = this.getNoteDuration(note, tempo);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // 音量包络
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.5, time + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, time + duration * 0.3);
    gainNode.gain.linearRampToValueAtTime(0, time + duration);

    oscillator.start(time);
    oscillator.stop(time + duration);

    return { oscillator, gainNode, duration };
  }

  async startPlaying(notes: Note[], tempo: number) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.isPlaying) {
      this.stopPlaying();
    }

    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.scheduledNotes = [];

    let currentTime = this.audioContext!.currentTime;

    for (const note of notes) {
      if (!this.isPlaying) break;

      const noteObj = await this.playNote(note, tempo, currentTime);
      if (noteObj) {
        this.scheduledNotes.push(noteObj);
        currentTime += noteObj.duration;
      }
    }
  }

  stopPlaying() {
    this.isPlaying = false;
    
    // 停止所有已调度的音符
    for (const note of this.scheduledNotes) {
      try {
        note.oscillator.stop();
        note.gainNode.disconnect();
      } catch (e) {
        // 忽略已经停止的音符
      }
    }
    
    this.scheduledNotes = [];
    this.currentNoteIndex = 0;
  }
}

export const audioService = new AudioService(); 