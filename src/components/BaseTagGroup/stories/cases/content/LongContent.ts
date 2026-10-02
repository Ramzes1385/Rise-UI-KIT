import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const skills = [
	'TypeScript',
	'Vue 3 Composition API',
	'Pinia',
	'Vite',
	'Vitest',
	'Playwright',
	'Доступность интерфейсов (WCAG 2.2)',
	'SCSS',
	'Storybook',
	'Node.js',
	'REST и GraphQL',
	'CI/CD',
].map(label => ({ value: label, label }))

const template = `
	<div style="max-width: 360px;"><BaseTagGroup v-bind="args" :items="skills" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	args: { selectionMode: 'none', isRemovable: true, label: 'Навыки', modelValue: null },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: 'Много меток в узком контейнере (360px) переносятся на новые строки; длинный текст метки обрезается многоточием.',
			},
			source: storySource({ template, imports: ['BaseTagGroup'], script: `const skills = ${literal(skills)}`, omit: ['items'] }),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { data: { skills }, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Навыки' })
		await expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(group.getBoundingClientRect().height).toBeGreaterThan(60)
	},
}
