<template>
  <div class="control-bar">
    <button class="control-btn" @click="$emit('play')">
      <i class="icon">{{ isPlaying ? '⏸' : '▶' }}</i>
      {{ isPlaying ? '暂停' : '播放' }}
    </button>
    <button class="control-btn" @click="$emit('stop')">
      <i class="icon">⏹</i>
      停止
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean;
}>();

defineEmits<{
  (e: 'play'): void;
  (e: 'stop'): void;
}>();
</script>

<style scoped>
.control-bar {
  display: flex;
  gap: 12px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
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

.icon {
  font-style: normal;
}
</style> 