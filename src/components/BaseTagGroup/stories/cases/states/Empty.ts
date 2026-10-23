import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<BaseTagGroup v-bind="args" />
		<span v-if="!args.items.length" class="story-label">Фильтры не выбраны</span>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	args: { items: [], modelValue: [], label: 'Фильтры' },
	parameters: {
		controls: { include: ['items'] },
		docs: {
			description: { story: 'Пустая группа ничего не рисует: подпись «ничего не выбрано» показывает приложение рядом с ней.' },
			source: storySource({ template, imports: ['BaseTagGroup'] }),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Фильтры' }).children).toHaveLength(0)
		await expect(canvas.getByText('Фильтры не выбраны')).toBeVisible()
	},
}
