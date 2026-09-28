import { Sample } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const BrandColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска бренда: палитра primary переопределена на контейнере с `data-theme` — кнопки, бейдж, переключатель,',
					'чекбокс и фокус получают фиолетовый бренд без правок стилей компонентов.',
				].join('\n'),
			},
			source: {
				code: [
					':root {',
					'  --rise-color-primary-50: #f5f3ff;',
					'  --rise-color-primary-100: #ede9fe;',
					'  --rise-color-primary-200: #ddd6fe;',
					'  --rise-color-primary-300: #c4b5fd;',
					'  --rise-color-primary-400: #a78bfa;',
					'  --rise-color-primary-700: #6d28d9;',
					'  --rise-color-primary-800: #5b21b6;',
					'  /* …и остальные оттенки 500–950 */',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { Sample },
		template: `
			<div
				class="fnd-themes__panel"
				data-theme="light"
				style="--rise-color-primary-50: #f5f3ff; --rise-color-primary-100: #ede9fe; --rise-color-primary-200: #ddd6fe; --rise-color-primary-300: #c4b5fd; --rise-color-primary-400: #a78bfa; --rise-color-primary-500: #8b5cf6; --rise-color-primary-600: #7c3aed; --rise-color-primary-700: #6d28d9; --rise-color-primary-800: #5b21b6; --rise-color-primary-900: #4c1d95; --rise-color-primary-950: #2e1065;">
				<Sample />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Сохранить' })).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
