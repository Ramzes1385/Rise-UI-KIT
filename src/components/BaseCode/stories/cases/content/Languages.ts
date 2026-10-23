import { expect } from 'storybook/test'
import { CODE_SAMPLES } from '../../shared'
import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const samples = Object.entries(CODE_SAMPLES).map(([language, code]) => ({ language, code }))

const template = `
	<div class="story-grid">
		<BaseCode v-for="sample in samples" :key="sample.language" v-bind="args" :language="sample.language" :code="sample.code" />
	</div>
`

export const Languages: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Встроенный токенизатор без зависимостей: JavaScript и TypeScript, JSON, HTML и Vue (скрипт, стили, выражения',
					'шаблона и директивы), CSS и SCSS, Bash, Python. Язык — имя или псевдоним из блока Markdown: `js`, `ts`, `sh`, `py`.',
					'Другой язык показывается простым текстом.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCode'], script: `const samples = ${literal(samples)}` }),
		},
		controls: { include: ['variant', 'hasLineNumbers', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args, { data: { samples } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		for (const name of ['JavaScript', 'TypeScript', 'JSON', 'HTML', 'Vue', 'CSS', 'SCSS', 'Bash', 'Python']) {
			await expect(canvas.getByText(name, { selector: '.base-code__title' })).toBeVisible()
		}
		await expect(canvasElement.querySelector('.base-code__token--tag')).toHaveTextContent('article')
	},
}
