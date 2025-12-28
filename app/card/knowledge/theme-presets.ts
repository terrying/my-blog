import { ThemeConfig } from './types'

export const THEMES: Record<string, ThemeConfig> = {
  'default-blue': {
    id: 'default-blue',
    name: '经典蓝 (笔记)',
    container: 'bg-white shadow-xl',
    backgroundPattern:
      'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
    fontFamily: '"KaiTi", "STKaiti", "楷体", serif',
    colors: {
      primary: '#3b82f6',
      secondary: '#eff6ff',
      text: '#1f2937',
      highlight: '#fef08a',
      accent: '#2563eb',
    },
    classes: {
      title: 'text-5xl font-bold text-gray-900 tracking-wider mb-2',
      subtitle: 'text-lg text-gray-500 font-medium mb-8',
      sectionTitle:
        'text-xl font-bold text-white px-5 py-2 rounded-r-2xl rounded-tl-2xl shadow-sm transform -rotate-1',
      sectionContainer: 'mb-8',
      content: 'text-lg leading-relaxed text-gray-800 pl-4 border-l-2 border-gray-200',
    },
  },
  'modern-dark': {
    id: 'modern-dark',
    name: '极客黑 (暗色)',
    container: 'bg-gray-900 shadow-2xl border border-gray-800',
    backgroundPattern: 'radial-gradient(#374151 1px, transparent 1px)',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    colors: {
      primary: '#8b5cf6',
      secondary: '#111827',
      text: '#f3f4f6',
      highlight: '#4c1d95',
      accent: '#a78bfa',
    },
    classes: {
      title:
        'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4',
      subtitle:
        'text-gray-400 text-sm tracking-widest uppercase mb-10 border-b border-gray-800 pb-4',
      sectionTitle: 'text-lg font-bold text-purple-300 border-l-4 border-purple-500 pl-3 mb-3',
      sectionContainer: 'mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50',
      content: 'text-gray-300 leading-loose font-light',
    },
  },
  'retro-poster': {
    id: 'retro-poster',
    name: '复古海报',
    container: 'bg-[#f0e6d2] shadow-xl border-8 border-double border-[#2c2c2c]',
    fontFamily: '"Songti SC", "SimSun", serif',
    colors: {
      primary: '#c2410c',
      secondary: '#f0e6d2',
      text: '#2c2c2c',
      highlight: '#fbbf24',
      accent: '#9a3412',
    },
    classes: {
      title: 'text-6xl font-black text-[#2c2c2c] mb-4 text-center border-b-4 border-black pb-4',
      subtitle: 'text-center text-[#5c5c5c] font-bold mb-12 uppercase tracking-[0.2em]',
      sectionTitle:
        'text-2xl font-black text-[#c2410c] text-center mb-4 decoration-wavy underline decoration-[#2c2c2c]',
      sectionContainer: 'mb-10 text-center',
      content: 'text-xl font-medium text-[#2c2c2c] leading-normal',
    },
  },
}
