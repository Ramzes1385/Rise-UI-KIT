import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const hidden = ['title', 'description', 'icon', 'isCompact']

const template = `
	<div class="story-stack story-medium">
		<BaseEmpty v-bind="args" is-compact variant="ghost" description="Ничего не найдено" />
		<BaseEmpty v-bind="args" is-compact variant="soft" icon="search" description="По запросу «бюджет» результатов нет" />
	</div>
`

export const Compact: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Компактный вид (`isCompact`): одна строка без рамки и крупной иконки — для пустого списка, меню или панели.',
					'Иконка показывается только по `icon` или слоту `icon`. Так сделаны пустые состояния BaseAutocomplete, BaseSearch,',
					'BaseCommandPalette и других компонентов кита.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEmpty'], omit: hidden }),
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: useStorySetup(args, { slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Ничего не найдено')).toBeVisible()
		await expect(canvas.queryByRole('heading')).toBeNull()
	},
}
