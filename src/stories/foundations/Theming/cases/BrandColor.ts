import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import { Sample, SAMPLE_SOURCE } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div
		class="fnd-themes__panel"
		data-theme="light"
		style="--rise-color-primary-50: #f5f3ff; --rise-color-primary-100: #ede9fe; --rise-color-primary-200: #ddd6fe; --rise-color-primary-300: #c4b5fd; --rise-color-primary-400: #a78bfa; --rise-color-primary-500: #8b5cf6; --rise-color-primary-600: #7c3aed; --rise-color-primary-700: #6d28d9; --rise-color-primary-800: #5b21b6; --rise-color-primary-900: #4c1d95; --rise-color-primary-950: #2e1065; --rise-color-primary-on: #ffffff; --rise-color-primary-hover: #5b21b6;">
		<Sample />
	</div>
`

export const BrandColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска бренда: палитра primary переопределена на контейнере с `data-theme` — кнопки, бейдж, переключатель,',
					'чекбокс и фокус получают фиолетовый бренд без правок стилей компонентов. Заливка кнопки берёт шаг 600; текст на ней и наведение задают сиды `-on` и `-hover` (у янтарного бренда текст тёмный, у фиолетового — белый). Проще всего получить всё сразу из `createTheme()` (страница «Конструктор темы»).',
					'',
					'```css',
					':root {',
					'  --rise-color-primary-50: #f5f3ff;',
					'  --rise-color-primary-100: #ede9fe;',
					'  --rise-color-primary-200: #ddd6fe;',
					'  --rise-color-primary-300: #c4b5fd;',
					'  --rise-color-primary-400: #a78bfa;',
					'  --rise-color-primary-600: #7c3aed; /* заливка кнопок в светлой теме */',
					'  --rise-color-primary-700: #6d28d9;',
					'  /* …и остальные оттенки 500–950 */',
					'  --rise-color-primary-on: #ffffff; /* текст на заливке: у фиолетового — белый */',
					'  --rise-color-primary-hover: #5b21b6; /* наведение: темнее */',
					'}',
					'```',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: [], components: { Sample: SAMPLE_SOURCE } }),
		},
	},
	render: args => ({
		components: { Sample },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Сохранить' })).backgroundColor).toBe('rgb(124, 58, 237)')
	},
}
