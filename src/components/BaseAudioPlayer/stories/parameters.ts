import type { Meta } from '@storybook/vue3-vite'
import type BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Компактный аудиоплеер: пуск и пауза, волна (BaseWaveform) с перемоткой, время и скорость. Для голосовых',
				'сообщений, подкастов и коротких записей; видео и длинные записи с главами — BaseMediaPlayer.',
				'',
				'- `src` — адрес записи (относительный или http:, https:, blob:, data:), `title` — доступное имя, `hasTitle` — показать его.',
				'- Волна: `peaks` с сервера или, без них, амплитуды из самого файла через Web Audio (файл с того же сайта или по CORS);',
				'  пока их нет — ровные столбики. `duration` показывает длительность до загрузки файла.',
				'- До запуска показана длительность, после — «позиция / длительность». Кнопка скорости перебирает `playbackRates`.',
				'- `isExclusive` (по умолчанию): на странице играет один такой плеер — запуск ставит остальные на паузу.',
				'- `v-model:current-time`, события `play`, `pause`, `ended`, `error`; через ref — `play()`, `pause()`, `getMediaElement()`.',
				'- Варианты: default — карточка с рамкой, soft — приподнятый фон, ghost — без фона, цвета от текста вокруг (пузырь чата).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAudioPlayer>['parameters']
