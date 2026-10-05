import type { Meta } from '@storybook/vue3-vite'
import type BaseReasoning from '../ui/BaseReasoning.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Рассуждения модели перед ответом — сворачиваемый блок с заголовком-кнопкой (`aria-expanded`).',
				'',
				'- Пока `is-streaming`, заголовок «Думает…» переливается (без анимации при `prefers-reduced-motion`),',
				'  блок раскрыт; по окончании сворачивается и показывает «Думал 12 с» — `has-auto-toggle`, если его не трогали.',
				'- Длительность — `duration` в секундах; без него замеряется по `is-streaming`.',
				'- Текст — Markdown (`content`, BaseMarkdown) или слот `default`; заголовок — `title` или слот `title`.',
				'- Состояние — `v-model:is-open`. Свёрнутое содержимое недоступно фокусу и скринридеру (`inert`).',
				'- Раскрытие — по высоте (строки сетки 0fr↔1fr) с проявлением, шеврон поворачивается; всё на токенах движения (история «Анимации»).',
				'- Перекраска — токены `--rise-reasoning-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseReasoning>['parameters']
