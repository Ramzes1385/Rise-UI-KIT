import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-col">
		<BaseTagGroup v-bind="args" v-model="selected" />
		<span class="story-label" role="status">Выбрано: {{ selected ?? 'ничего' }}</span>
	</div>
`

export const Single: StoryObj<typeof meta> = {
	args: { selectionMode: 'single', modelValue: 'vue', label: 'Основной фреймворк', tone: 'primary' },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: 'Одна выбранная (`selectionMode="single"`): `v-model` — значение. Выбор другой метки снимает прежний; повторное нажатие на выбранную — `null`.',
			},
			source: storySource({ template, imports: ['BaseTagGroup'], models, types: { selected: 'TagGroupModelValue' } }),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const svelte = canvas.getByRole('button', { name: 'Svelte' })
		await tabTo(svelte, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(svelte).toHaveAttribute('aria-pressed', 'true')
		await expect(canvas.getByRole('button', { name: 'Vue' })).toHaveAttribute('aria-pressed', 'false')
		await expect(canvas.getByRole('status')).toHaveTextContent('Выбрано: svelte')
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Выбрано: ничего')
	},
}
