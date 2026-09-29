import type { Meta } from '@storybook/vue3-vite'
import type BaseWaveform from '../ui/BaseWaveform.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Волна записи: столбики амплитуд, сыгранная часть цветом, перемотка щелчком, перетаскиванием и клавишами,',
				'выделение фрагмента. Основа BaseAudioPlayer и голосовых сообщений; подходит и для редакторов звука.',
				'',
				'- `peaks` — амплитуды от 0 до 1: `computeWaveformPeaks(отсчёты, столбики)`, `decodeWaveformPeaks(адрес, столбики)`',
				'  из utils или готовые с сервера. `duration` — длительность в секундах.',
				'- `v-model:current-time` — позиция; `v-model:selection` — фрагмент `{ start, end }` в секундах.',
				'- `isSelectable` — фрагмент выделяется перетаскиванием и стрелками с Shift, Escape снимает выделение;',
				'  щелчок без перетаскивания перематывает и снимает выделение.',
				'- Клавиатура (role="slider"): ←/→ и ↓/↑ — ±`step`, PageUp/PageDown — десятая часть записи, Home/End — начало и конец.',
				'  `aria-valuetext` — «0:20 из 1:05», выделенный фрагмент озвучивается описанием «Фрагмент 0:12–0:30».',
				'- Варианты: default — сыгранная часть цветом primary; soft — оттенки текущего цвета текста, для пузырей чата.',
				'  `color` задаёт цвет сыгранной части.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseWaveform>['parameters']
