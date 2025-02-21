<template>
  <canvas ref="staffCanvas" class="staff-canvas" @click="handleCanvasClick"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Note, KeySignature } from '../types/music';
import { KEY_SIGNATURES, NOTE_POSITIONS, MIDDLE_C_POSITION } from '../types/music';

const props = defineProps<{
  notes: Note[];
  selectedNoteId: number | null;
  keySignature: KeySignature;
  tempo: number;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
}>();

const emit = defineEmits<{
  (e: 'noteSelected', noteId: number | null): void;
}>();

const staffCanvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// Canvas 初始化
onMounted(() => {
  if (staffCanvas.value) {
    ctx = staffCanvas.value.getContext('2d');
    initCanvas();
    drawStaff();
  }
});

// 监听画布大小变化
const resizeObserver = new ResizeObserver(() => {
  if (staffCanvas.value) {
    initCanvas();
    drawStaff();
  }
});

onMounted(() => {
  if (staffCanvas.value) {
    resizeObserver.observe(staffCanvas.value);
  }
});

// Canvas 相关方法
function initCanvas() {
  if (!staffCanvas.value || !ctx) return;
  
  const container = staffCanvas.value.parentElement;
  if (!container) return;
  
  staffCanvas.value.width = container.clientWidth;
  staffCanvas.value.height = container.clientHeight;
}

function drawStaff() {
  if (!ctx || !staffCanvas.value) return;
  
  ctx.clearRect(0, 0, staffCanvas.value.width, staffCanvas.value.height);
  
  // 绘制五线谱
  const startY = 60;
  const lineSpacing = 10;
  
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  
  // 绘制五线谱主线
  for (let i = 0; i < 5; i++) {
    const y = startY + i * lineSpacing;
    ctx.moveTo(30, y);
    ctx.lineTo(staffCanvas.value.width - 30, y);
  }
  ctx.stroke();
  
  // 绘制高音谱号
  ctx.font = '45px serif';
  ctx.fillText('𝄞', 10, 85);
  
  // 绘制调号
  const keySignatureWidth = drawKeySignature();

  // 绘制拍号
  const timeSignatureWidth = drawTimeSignature(keySignatureWidth);

  // 绘制小节线和音符
  drawBarsAndNotes(keySignatureWidth + timeSignatureWidth);
}

function drawKeySignature() {
  if (!ctx) return 0;
  
  const accidentals = KEY_SIGNATURES[props.keySignature];
  if (accidentals.length > 0) {
    ctx.font = '16px serif';
    accidentals.forEach((acc, index) => {
      ctx!.fillText(acc.accidental === 'sharp' ? '♯' : '♭', 50 + index * 12, 70);
    });
  }
  return 30; // 返回调号占用的宽度
}

function drawTimeSignature(x: number) {
  if (!ctx) return 0;
  
  ctx.font = '24px serif';
  ctx.fillStyle = '#000';
  
  // 绘制分子
  ctx.fillText(props.timeSignature.numerator.toString(), x + 10, 70);
  
  // 绘制分母
  ctx.fillText(props.timeSignature.denominator.toString(), x + 10, 90);
  
  return 30; // 返回拍号占用的宽度
}

function drawBarsAndNotes(startX: number) {
  if (!ctx || !staffCanvas.value) return;

  const noteSpacing = 40;
  const startY = 60;
  const lineSpacing = 10;
  
  // 计算每小节的时值总和
  const barDuration = props.timeSignature.numerator * (4 / props.timeSignature.denominator);
  let currentBarDuration = 0;
  let currentX = startX + 20;

  props.notes.forEach((note) => {
    // 计算音符时值
    const noteDurationValue = calculateNoteDurationValue(note.duration);
    if (currentBarDuration + noteDurationValue > barDuration) {
      // 绘制小节线
      drawBarLine(currentX);
      currentX += 20;
      currentBarDuration = 0;
    }

    // 绘制音符
    const y = startY + calculateNotePosition(note) * (lineSpacing / 2);
    drawNote(note, currentX, y, props.selectedNoteId === note.id);
    
    currentX += noteSpacing;
    currentBarDuration += noteDurationValue;
  });

  // 绘制最后一个小节线
  if (props.notes.length > 0) {
    drawBarLine(currentX);
  }
}

function calculateNoteDurationValue(duration: string): number {
  const durationMap: Record<string, number> = {
    '1': 4,
    '1/2': 2,
    '1/4': 1,
    '1/8': 0.5
  };
  return durationMap[duration] || 0;
}

function drawBarLine(x: number) {
  if (!ctx || !staffCanvas.value) return;
  
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.moveTo(x, 60);
  ctx.lineTo(x, 100);
  ctx.stroke();
}

function calculateNotePosition(note: Note): number {
  // 基本音高位置
  const basePosition = NOTE_POSITIONS[note.pitch];
  console.log(note.pitch, note.octave, basePosition);
  
  // 计算八度偏移
  // 每个八度是7个音程，所以每个八度的偏移是3.5个位置（7个半格）
  const octaveOffset = (note.octave - 4) * 7;  // 4是中央C的八度数
  
  // 最终位置计算
  // MIDDLE_C_POSITION 代表中央C的位置
  // basePosition 代表在一个八度内的相对位置
  // octaveOffset 代表八度的整体偏移
  return MIDDLE_C_POSITION - basePosition - octaveOffset;
}

function drawNote(note: Note, x: number, y: number, isSelected: boolean = false) {
  if (!ctx) return;

  const noteRadius = 6;
  const staffTop = 60;    // 第一线的位置
  const staffBottom = 100; // 第五线的位置
  const lineSpacing = 10;  // 线间距
  
  // 设置音符颜色
  ctx.fillStyle = isSelected ? '#4CAF50' : '#000';
  
  if (note.isRest) {
    // 绘制休止符
    ctx.font = '24px serif';
    const restSymbol = note.duration === '1' ? '𝄻' :  // 全休止符
                      note.duration === '1/2' ? '𝄼' :  // 二分休止符
                      note.duration === '1/4' ? '𝄽' :  // 四分休止符
                      '𝄾';  // 八分休止符
    ctx.fillText(restSymbol, x - 8, 80);  // 统一显示在第三线上
    return;
  }
  
  // 绘制音符头部
  ctx.beginPath();
  ctx.ellipse(x, y, noteRadius, noteRadius - 2, 0, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制辅助线
  if (y < staffTop || y > staffBottom) {
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? '#4CAF50' : '#000';
    ctx.lineWidth = 1;

    // 计算需要的辅助线
    const step = y < staffTop ? -lineSpacing : lineSpacing;
    let lineY = y < staffTop ? staffTop - lineSpacing : staffBottom + lineSpacing;
    
    while ((y < staffTop && lineY >= y - lineSpacing / 2) || 
           (y > staffBottom && lineY <= y + lineSpacing / 2)) {
      ctx.moveTo(x - 10, lineY);
      ctx.lineTo(x + 10, lineY);
      lineY += step;
    }
    ctx.stroke();
  }

  // 绘制符干（除了全音符外都有符干）
  if (note.duration !== '1') {
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? '#4CAF50' : '#000';
    ctx.lineWidth = 1;
    
    const stemHeight = 30;
    // 统一将符干绘制在右侧
    const stemX = x + noteRadius - 1;
    ctx.moveTo(stemX, y);
    ctx.lineTo(stemX, y - stemHeight);  // 向上绘制
    ctx.stroke();

    // 绘制符尾（八分音符）
    if (note.duration === '1/8') {
      ctx.beginPath();
      const stemEndY = y - stemHeight;
      ctx.moveTo(stemX, stemEndY);
      ctx.quadraticCurveTo(
        stemX + 10,
        stemEndY + 5,
        stemX + 15,
        stemEndY + 10
      );
      ctx.stroke();
    }
  }

  // 绘制附点
  if (note.dotted) {
    ctx.beginPath();
    ctx.arc(x + noteRadius * 2, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 绘制临时记号
  if (note.accidental) {
    ctx.font = '16px serif';
    const symbol = note.accidental === 'sharp' ? '♯' : note.accidental === 'flat' ? '♭' : '♮';
    ctx.fillText(symbol, x - 15, y + 5);
  }
}

function handleCanvasClick(event: MouseEvent) {
  if (!staffCanvas.value) return;

  const rect = staffCanvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 检查是否点击到音符
  const startX = 100;
  const noteSpacing = 40;
  const noteRadius = 6;
  const startY = 60;
  const lineSpacing = 10;

  const clickedNote = props.notes.find(note => {
    const noteX = startX + props.notes.indexOf(note) * noteSpacing;
    const noteY = startY + calculateNotePosition(note) * (lineSpacing / 2);
    
    return Math.abs(x - noteX) < noteRadius * 2 &&
           Math.abs(y - noteY) < noteRadius * 2;
  });

  emit('noteSelected', clickedNote?.id || null);
}

// 监听属性变化
watch([() => props.notes, () => props.keySignature, () => props.tempo, () => props.selectedNoteId, () => props.timeSignature], () => {
  drawStaff();
});
</script>

<style scoped>
.staff-canvas {
  width: 100%;
  height: 100%;
}
</style> 