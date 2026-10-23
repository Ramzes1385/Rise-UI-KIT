import type BaseBadge from '../ui/BaseBadge.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Компактная метка: статус, категория, счётчик, «Новое».',
				'',
				'- Варианты как у кнопки: `default` — заливка основным цветом, `soft` — мягкий фон,',
				'  `outline`, `ghost`, `shadow` — нейтральные.',
				'- Высота 20px при `sizeScale` = 100, текст 12/16. Длинный `label` обрезается многоточием.',
				'- Новый `label` появляется с коротким «pop» на токенах движения (история «Анимации»).',
				'- Перекраска — токены `--rise-badge-*`, классы частей — проп `ui` (история «Токены»).',
				"- Статусы (успех, ошибка) — проп `color` с токенами роли: `{ bg: { base: 'var(--rise-success-soft)' }, text: { base: 'var(--rise-success-text)' } }`.",
				'',
				'Бейдж не интерактивный: для действий используйте `BaseButton`, для индикатора поверх элемента — `BaseChip`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBadge>['parameters']
