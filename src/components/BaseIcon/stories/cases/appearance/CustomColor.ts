import { expect } from 'storybook/test'
import type meta from '../../BaseIcon.stories'
import BaseIcon from '../../../ui/BaseIcon.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const samples = [
	{ name: 'info', token: '--rise-info' },
	{ name: 'check-circle', token: '--rise-success' },
	{ name: 'alert-triangle', token: '--rise-warning' },
	{ name: 'x-circle', token: '--rise-error' },
	{ name: 'search', token: '--rise-text-muted' },
]

const template = `
	<div class="story-col">
		<div v-for="sample in samples" :key="sample.token" class="story-row">
			<BaseIcon v-bind="args" :name="sample.name" :color="'var(' + sample.token + ')'" />
			<span class="story-label">{{ sample.token }}</span>
		</div>
		<div class="story-row" style="gap: 6px; color: var(--rise-primary-text);">
			<BaseIcon v-bind="args" name="star" />
			<span>Без color — цвет текста вокруг</span>
		</div>
	</div>
`

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['name', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Цвет: без `color` иконка берёт цвет текста вокруг (`currentColor`), с `color` — заданный.',
					'Используйте токены: `var(--rise-text-muted)` для второстепенных иконок, цвет роли для статусов.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseIcon'],
				script: `const samples = ${literal(samples)}`,
				omit: ['name', 'color'],
			}),
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: useStorySetup(args, { data: { samples }, slots: ['name', 'color'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [info, , , error] = canvasElement.querySelectorAll('svg')
		await expect(error.style.color).toBe('var(--rise-error)')
		await expect(getComputedStyle(error).color).not.toBe(getComputedStyle(info).color)
	},
}
