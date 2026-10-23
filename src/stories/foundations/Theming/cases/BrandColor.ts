import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import { Sample, SAMPLE_SOURCE } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { resolveColor, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div
		class="fnd-themes__panel"
		data-theme="light"
		style="--rise-color-primary-50: #f5f3ff; --rise-color-primary-100: #ede9fe; --rise-color-primary-200: #ddd6fe; --rise-color-primary-300: #c4b5fd; --rise-color-primary-400: #a78bfa; --rise-color-primary-500: #8b5cf6; --rise-color-primary-600: #7c3aed; --rise-color-primary-700: #6d28d9; --rise-color-primary-800: #5b21b6; --rise-color-primary-900: #4c1d95; --rise-color-primary-950: #2e1065;">
		<Sample />
	</div>
`

export const BrandColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска бренда: палитра primary переопределена на контейнере с `data-theme` — кнопки, бейдж, переключатель,',
					'чекбокс и фокус получают фиолетовый бренд без правок стилей компонентов. Заливка кнопки — шаг 700, наведение — 800',
					'(на шаг темнее), текст на заливке — светлый, нейтраль 50: на шаге 700 он должен брать 4.5:1. Тёмный текст на светлом',
					'бренде задают ещё сиды `--rise-color-primary-on` и `-hover` (наведение тогда светлее). Проще всего получить всё сразу',
					"из `createTheme()` (страница «Конструктор темы», для тёмного текста — `text: 'dark'`).",
					'',
					'```css',
					':root {',
					'  --rise-color-primary-50: #f5f3ff;',
					'  --rise-color-primary-100: #ede9fe;',
					'  --rise-color-primary-200: #ddd6fe;',
					'  --rise-color-primary-300: #c4b5fd;',
					'  --rise-color-primary-400: #a78bfa;',
					'  --rise-color-primary-600: #7c3aed;',
					'  --rise-color-primary-700: #6d28d9; /* заливка кнопок: светлый текст берёт на ней 4.5:1 */',
					'  --rise-color-primary-800: #5b21b6; /* наведение и текст роли */',
					'  /* …и остальные оттенки 500–950 */',
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
		const save = getComputedStyle(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(save.backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(save.color).toBe(resolveColor('var(--rise-color-neutral-50)'))
	},
}
