import { expect } from 'storybook/test'
import type meta from '../../BaseAnchor.stories'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<BaseAnchor v-bind="args" :content="'#' + boxId" />
		<div :id="boxId" class="story-frame">
			<p>Короткая заметка без заголовков: оглавление не выводится.</p>
		</div>
	</div>
`

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Нет пунктов (пустой `items` или нет заголовков) — компонент ничего не выводит: пустой `<nav>` мешал бы скринридеру.',
			},
			source: storySource({ template, imports: ['BaseAnchor'], script: `const boxId = 'note'` }),
		},
	},
	render: (args, { id }) => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { boxId: `note-${id}` } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/оглавление не выводится/)).toBeVisible()
		await expect(canvas.queryByRole('navigation')).toBeNull()
	},
}
