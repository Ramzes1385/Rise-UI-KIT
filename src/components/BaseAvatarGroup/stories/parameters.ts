import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Группа аватаров внахлёст: участники проекта, соавторы документа. Лишние — «+N».',
				'',
				'- Разметка — список: скринридер слышит имена людей (аватары скрыты) и «и ещё N»; имя группы — `ariaLabel`.',
				'- `max` — сколько аватаров показать; если остаётся один человек, показывается и он, а не «+1».',
				'- Вариант и форма (`shape`) передаются каждому аватару.',
				'- Смена состава и числа «+N» — плавная: «pop» на токенах движения, соседи сдвигаются (история «Анимации»).',
				'- Перекраска — токены `--rise-avatar-group-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAvatarGroup>['parameters']
