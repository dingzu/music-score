<template>
  <div class="score-editor">
    <header class="editor-header">
      <h1>{{ scoreStore.score.title }}</h1>
      <ControlBar 
        :is-playing="isPlaying"
        @play="handlePlay"
        @stop="handleStop"
      />
    </header>
    
    <main class="editor-main">
      <div class="score-area">
        <StaffCanvas
          :notes="scoreStore.allNotes"
          :selected-note-id="selectedNoteId"
          :key-signature="scoreStore.score.keySignature"
          :tempo="scoreStore.score.tempo"
          :time-signature="scoreStore.score.defaultTimeSignature"
          @note-selected="handleNoteSelected"
        />
      </div>
      <SettingsPanel
        v-model:tempo="scoreStore.score.tempo"
        v-model:key-signature="scoreStore.score.keySignature"
        v-model:time-signature="scoreStore.score.defaultTimeSignature"
        :selected-note="selectedNote"
        :durations="durations"
        @update-note-duration="updateNoteDuration"
        @update-note-dotted="updateNoteDotted"
        @update-note-accidental="updateNoteAccidental"
        @add-numeric-notes="handleNumericInput"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useScoreStore } from '../stores/scoreStore';
import StaffCanvas from '../components/StaffCanvas.vue';
import ControlBar from '../components/ControlBar.vue';
import SettingsPanel from '../components/SettingsPanel.vue';
import type { Note } from '../types/music';
import { audioService } from '../services/audioService';

const scoreStore = useScoreStore();

// 播放控制
const isPlaying = ref(false);

// 音符选择状态
const selectedNoteId = ref<number | null>(null);
const selectedNote = computed(() => 
  selectedNoteId.value ? scoreStore.allNotes.find((note: Note) => note.id === selectedNoteId.value) || null : null
);

// 音符时值选项
const durations = [
  { value: '1', label: '全音符' },
  { value: '1/2', label: '二分音符' },
  { value: '1/4', label: '四分音符' },
  { value: '1/8', label: '八分音符' }
];

// 播放控制方法
async function handlePlay() {
  if (!isPlaying.value) {
    isPlaying.value = true;
    await audioService.startPlaying(scoreStore.allNotes, scoreStore.score.tempo);
  } else {
    handleStop();
  }
}

function handleStop() {
  isPlaying.value = false;
  audioService.stopPlaying();
}

// 音符设置方法
function updateNoteDuration(duration: string) {
  if (selectedNoteId.value) {
    scoreStore.updateNote(selectedNoteId.value, { duration: duration as Note['duration'] });
  }
}

function updateNoteDotted(dotted: boolean) {
  if (selectedNoteId.value) {
    scoreStore.updateNote(selectedNoteId.value, { dotted });
  }
}

function updateNoteAccidental(accidental: 'sharp' | 'flat' | 'natural' | null) {
  if (selectedNoteId.value) {
    scoreStore.updateNote(selectedNoteId.value, { accidental: accidental || undefined });
  }
}

// 处理音符选择
function handleNoteSelected(noteId: number | null) {
  selectedNoteId.value = noteId;
}

// 处理简谱输入
function handleNumericInput(input: string) {
  scoreStore.addNotesFromNumeric(input);
}
</script>

<style scoped>
.score-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.editor-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.score-area {
  flex: 1;
  overflow: hidden;
  background-color: #fff;
  padding: 20px;
}
</style> 