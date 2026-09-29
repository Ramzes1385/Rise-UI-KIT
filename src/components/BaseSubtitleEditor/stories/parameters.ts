import type { Meta } from '@storybook/vue3-vite'
import type BaseSubtitleEditor from '../ui/BaseSubtitleEditor.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Редактор субтитров: реплики списком (начало, конец, текст) и на шкале времени, связь с плеером через',
				'`v-model:current-time`, загрузка .vtt и .srt, скачивание в обоих форматах.',
				'',
				'- `v-model:cues` — реплики `{ start, end, text }` в секундах; редактор держит их по порядку начала.',
				'- Время вводится как `1:02.5`, `0:01:02,500` или `62.5`; неверное время и конец раньше начала подсвечиваются',
				'  и не применяются. «Добавить реплику» ставит новую в текущую позицию на `cueLength` секунд.',
				'- Текущая реплика подсвечена в списке (`aria-current`) и на шкале; щелчок по шкале и «Перейти к реплике» меняют',
				'  позицию. Шкала — для мыши, всё то же доступно с клавиатуры в списке.',
				'- Файлы: `parseSubtitles`, `decodeSubtitles` (UTF-8, UTF-16, Windows-1251) и `serializeSubtitles` из utils;',
				'  при скачивании приходит событие `export` с текстом файла.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSubtitleEditor>['parameters']
