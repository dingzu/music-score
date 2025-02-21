import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ScoreState, Note, NotePitch, NoteDuration, KeySignature, Octave } from '../types/music';
import { NOTE_POSITIONS } from '../types/music';

export const useScoreStore = defineStore('score', () => {
  // 状态
  const score = ref<ScoreState>({
    id: 1,
    title: '新乐谱',
    voices: [
      {
        id: 1,
        name: '主旋律',
        clef: 'treble',
        bars: [
          {
            id: 1,
            notes: [],
            timeSignature: {
              numerator: 4,
              denominator: 4
            }
          }
        ]
      }
    ],
    tempo: 120,
    keySignature: 'C',
    defaultTimeSignature: {
      numerator: 4,
      denominator: 4
    }
  });

  let nextNoteId = 1;
  let nextBarId = 2;
  let nextVoiceId = 2;

  // 计算属性
  const currentVoice = computed(() => score.value.voices[0]); // 暂时只处理第一个声部
  const currentBar = computed(() => currentVoice.value.bars[currentVoice.value.bars.length - 1]);
  const allNotes = computed(() => {
    return score.value.voices.flatMap(voice => 
      voice.bars.flatMap(bar => bar.notes)
    );
  });

  // 方法
  function addNote(
    pitch: NotePitch, 
    duration: NoteDuration, 
    octave: Octave, 
    options: { 
      dotted?: boolean; 
      accidental?: 'sharp' | 'flat' | 'natural';
      isRest?: boolean;
    } = {}
  ) {
    const note: Note = {
      id: nextNoteId++,
      pitch,
      duration,
      octave,
      dotted: options.dotted || false,
      accidental: options.accidental,
      isRest: options.isRest || false
    };

    currentBar.value.notes.push(note);
    return note;
  }

  function updateNote(noteId: number, updates: Partial<Note>) {
    const note = allNotes.value.find(n => n.id === noteId);
    if (note) {
      Object.assign(note, updates);
    }
  }

  function removeNote(noteId: number) {
    score.value.voices.forEach(voice => {
      voice.bars.forEach(bar => {
        const index = bar.notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
          bar.notes.splice(index, 1);
        }
      });
    });
  }

  function addBar() {
    currentVoice.value.bars.push({
      id: nextBarId++,
      notes: [],
      timeSignature: { ...score.value.defaultTimeSignature }
    });
  }

  function addVoice(name: string, clef: 'treble' | 'bass' = 'treble') {
    score.value.voices.push({
      id: nextVoiceId++,
      name,
      clef,
      bars: [
        {
          id: nextBarId++,
          notes: [],
          timeSignature: { ...score.value.defaultTimeSignature }
        }
      ]
    });
  }

  function updateTempo(newTempo: number) {
    score.value.tempo = newTempo;
  }

  function updateKeySignature(newKey: KeySignature) {
    score.value.keySignature = newKey;
  }

  function calculateNotePosition(note: Note): number {
    const basePosition = NOTE_POSITIONS[note.pitch];
    const octaveOffset = (4 - note.octave) * 7;
    return basePosition + octaveOffset;
  }

  // 从简谱数字添加音符
  function addNotesFromNumeric(input: string) {
    const numericToNote: Record<string, NotePitch> = {
      '1': 'C',
      '2': 'D',
      '3': 'E',
      '4': 'F',
      '5': 'G',
      '6': 'A',
      '7': 'B',
      '8': 'C', // 高音 C
      '9': 'D', // 高音 D
    };

    const baseOctave = 4;
    let i = 0;
    
    while (i < input.length) {
      let char = input[i];
      let currentOctave = baseOctave;
      
      // 处理八度标记
      if (char === '+') {
        currentOctave = baseOctave + 1;
        i++;
        char = input[i];
      } else if (char === '-') {
        currentOctave = baseOctave - 1;
        i++;
        char = input[i];
      }

      // 处理升降号
      let accidental: 'sharp' | 'flat' | undefined;
      if (char === '#') {
        accidental = 'sharp';
        i++;
        char = input[i];
      } else if (char === 'b') {
        accidental = 'flat';
        i++;
        char = input[i];
      }

      // 处理音符
      if (char === '0') {
        // 添加休止符（用不可见的 C 音符表示）
        addNote('C', '1/4', 4, { dotted: false, accidental: undefined, isRest: true });
      } else if (numericToNote[char]) {
        const pitch = numericToNote[char];
        // 8和9自动使用高八度，并确保在有效范围内
        const octave = Math.min(Math.max(
          (char === '8' || char === '9') ? currentOctave + 1 : currentOctave, 
          2
        ), 6) as Octave;
        addNote(pitch, '1/4', octave, { dotted: false, accidental });
      }

      i++;
    }
  }

  return {
    score,
    currentVoice,
    currentBar,
    allNotes,
    addNote,
    updateNote,
    removeNote,
    addBar,
    addVoice,
    updateTempo,
    updateKeySignature,
    calculateNotePosition,
    addNotesFromNumeric
  };
}); 