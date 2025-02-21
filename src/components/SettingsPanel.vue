<template>
  <div class="settings-panel">
    <div class="panel-section">
      <h3>基本设置</h3>
      <div class="setting-item">
        <label>速度 (BPM)</label>
        <div class="tempo-control">
          <input 
            type="range" 
            :value="tempo" 
            @input="(e) => $emit('update:tempo', parseInt((e.target as HTMLInputElement).value))"
            min="60" 
            max="180" 
            step="1"
          >
          <span class="tempo-value">{{ tempo }}</span>
        </div>
      </div>
      <div class="setting-item">
        <label>调号</label>
        <select 
          :value="keySignature"
          @change="(e) => $emit('update:keySignature', (e.target as HTMLSelectElement).value as KeySignature)"
        >
          <option value="C">C大调</option>
          <option value="G">G大调</option>
          <option value="D">D大调</option>
          <option value="A">A大调</option>
          <option value="F">F大调</option>
          <option value="Bb">B♭大调</option>
          <option value="Eb">E♭大调</option>
        </select>
      </div>
      <div class="setting-item">
        <label>拍号</label>
        <div class="time-signature">
          <select 
            :value="timeSignature.numerator"
            @change="(e) => $emit('update:timeSignature', { 
              numerator: parseInt((e.target as HTMLSelectElement).value), 
              denominator: timeSignature.denominator 
            })"
          >
            <option v-for="n in [2,3,4,6,9,12]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span>/</span>
          <select 
            :value="timeSignature.denominator"
            @change="(e) => $emit('update:timeSignature', { 
              numerator: timeSignature.numerator, 
              denominator: parseInt((e.target as HTMLSelectElement).value) 
            })"
          >
            <option v-for="n in [2,4,8,16]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="panel-section" v-if="selectedNote">
      <h3>音符设置</h3>
      <div class="setting-item">
        <label>时值</label>
        <div class="note-duration-buttons">
          <button 
            v-for="duration in durations" 
            :key="duration.value"
            :class="['duration-btn', selectedNote.duration === duration.value ? 'active' : '']"
            @click="$emit('updateNoteDuration', duration.value)"
          >
            {{ duration.label }}
          </button>
        </div>
      </div>
      <div class="setting-item">
        <label>附点</label>
        <input 
          type="checkbox" 
          :checked="selectedNote.dotted"
          @change="$emit('updateNoteDotted', !selectedNote.dotted)"
        >
      </div>
      <div class="setting-item">
        <label>临时记号</label>
        <select 
          :value="selectedNote.accidental || 'none'"
          @change="(e) => $emit('updateNoteAccidental', (e.target as HTMLSelectElement).value === 'none' ? null : (e.target as HTMLSelectElement).value as 'sharp' | 'flat' | 'natural')"
        >
          <option value="none">无</option>
          <option value="sharp">升号 (♯)</option>
          <option value="flat">降号 (♭)</option>
          <option value="natural">还原号 (♮)</option>
        </select>
      </div>
    </div>
    
    <div class="panel-section">
      <h3>简谱输入</h3>
      <div class="setting-item">
        <label>输入简谱（1-7 表示音高）</label>
        <div class="input-area">
          <input 
            v-model="numericInputLocal"
            class="numeric-input"
            placeholder="输入数字，如：1231"
            @keyup.enter="handleNumericInput"
          >
          <button class="control-btn" @click="handleNumericInput">添加</button>
        </div>
        <div class="input-hint">
          提示：1-7 表示音高，+1 表示高八度，-1 表示低八度<br>
          #1 表示升高半音，b1 表示降低半音<br>
          8 表示高音 C，9 表示高音 D，0 表示休止符
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Note, KeySignature } from '../types/music';

interface Duration {
  value: string;
  label: string;
}

defineProps<{
  tempo: number;
  keySignature: KeySignature;
  selectedNote: Note | null;
  durations: Duration[];
  timeSignature: {
    numerator: number;
    denominator: number;
  };
}>();

const emit = defineEmits<{
  (e: 'update:tempo', value: number): void;
  (e: 'update:keySignature', value: KeySignature): void;
  (e: 'update:timeSignature', value: { numerator: number; denominator: number }): void;
  (e: 'updateNoteDuration', value: string): void;
  (e: 'updateNoteDotted', value: boolean): void;
  (e: 'updateNoteAccidental', value: 'sharp' | 'flat' | 'natural' | null): void;
  (e: 'addNumericNotes', value: string): void;
}>();

const numericInputLocal = ref('');

function handleNumericInput() {
  if (numericInputLocal.value.trim()) {
    emit('addNumericNotes', numericInputLocal.value);
    numericInputLocal.value = '';
  }
}
</script>

<style scoped>
.settings-panel {
  width: 280px;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 24px;
}

.panel-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tempo-control input[type="range"] {
  flex: 1;
}

.tempo-value {
  min-width: 40px;
  text-align: right;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.note-duration-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.duration-btn {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.duration-btn.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.input-area {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.numeric-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.input-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.control-btn:hover {
  background-color: #45a049;
}

.time-signature {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style> 