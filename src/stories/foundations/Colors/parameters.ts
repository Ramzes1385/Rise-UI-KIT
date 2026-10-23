import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Цвета устроены в три уровня, как в Nuxt UI:',
				'',
				'1. **Палитры** `--rise-color-{роль}-{50…950}` — сырые оттенки ролей `primary`, `neutral`, `success`, `info`, `warning`, `error`.',
				'2. **Семантические токены** `--rise-*` — что именно красится: фон, текст, рамки, заливка роли. Значения зависят от темы.',
				'3. **Компоненты** используют только семантические токены, поэтому тёмная тема и перекраска работают без правок стилей.',
				'',
				'Пары «текст/фон» проходят WCAG 2.2 AA в обеих темах (`npm run test:contrast`).',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
