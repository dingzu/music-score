// 音符时值
export type NoteDuration = '1' | '1/2' | '1/4' | '1/8';

// 音高（C4 表示中央C）
export type NotePitch = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

// 八度范围
export type Octave = 2 | 3 | 4 | 5 | 6;

// 调号
export type KeySignature = 'C' | 'G' | 'D' | 'A' | 'F' | 'Bb' | 'Eb';

// 单个音符
export interface Note {
  id: number;
  pitch: NotePitch;
  duration: NoteDuration;
  octave: Octave;
  dotted: boolean;  // 附点音符
  accidental?: 'sharp' | 'flat' | 'natural';  // 临时升降记号
  tied?: boolean;  // 是否连音
  isRest?: boolean;  // 是否为休止符
}

// 小节
export interface Bar {
  id: number;
  notes: Note[];
  timeSignature: {
    numerator: number;    // 分子（每小节拍数）
    denominator: number;  // 分母（以几分音符为一拍）
  };
}

// 声部
export interface Voice {
  id: number;
  name: string;
  bars: Bar[];
  clef: 'treble' | 'bass';  // 谱号
}

// 乐谱状态
export interface ScoreState {
  id: number;
  title: string;
  composer?: string;
  voices: Voice[];
  tempo: number;
  keySignature: KeySignature;
  defaultTimeSignature: {
    numerator: number;
    denominator: number;
  };
}

// 音符位置计算辅助对象（相对于中央C的半步数）
export const NOTE_POSITIONS: Record<NotePitch, number> = {
  'C': 0,    // 中央C作为基准点
  'D': 1,    // 向上一个位置
  'E': 2,    // 向上两个位置
  'F': 3,    // 向上三个位置
  'G': 4,    // 向上四个位置
  'A': 5,    // 向上五个位置
  'B': 6     // 向上六个位置
};

// 中央C的基准位置（从五线谱最底线开始数，以半间距为单位）
export const MIDDLE_C_POSITION = 10;  // 中央C在第一加线位置

// 调号定义
export const KEY_SIGNATURES: Record<KeySignature, Array<{ note: NotePitch; accidental: 'sharp' | 'flat' }>> = {
  'C': [],
  'G': [{ note: 'F', accidental: 'sharp' }],
  'D': [{ note: 'F', accidental: 'sharp' }, { note: 'C', accidental: 'sharp' }],
  'A': [{ note: 'F', accidental: 'sharp' }, { note: 'C', accidental: 'sharp' }, { note: 'G', accidental: 'sharp' }],
  'F': [{ note: 'B', accidental: 'flat' }],
  'Bb': [{ note: 'B', accidental: 'flat' }, { note: 'E', accidental: 'flat' }],
  'Eb': [{ note: 'B', accidental: 'flat' }, { note: 'E', accidental: 'flat' }, { note: 'A', accidental: 'flat' }]
}; 