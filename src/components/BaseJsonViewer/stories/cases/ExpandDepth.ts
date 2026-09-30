import { SMALL } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseJsonViewer from '../../ui/BaseJsonViewer.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseJsonViewer v-bind="args" />
		<BaseJsonViewer :value="small" label="Пакет" :has-toolbar="false" variant="soft" />
		<BaseJsonViewer :value="'просто строка'" label="Строка" :has-toolbar="false" variant="outline" />
	</div>
`

export const ExpandDepth: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`expandDepth: 2` — раскрыты два уровня; `hasToolbar: false` — без панели. Значение в корне может быть и не объектом.',
			},
			source: storySource({ template, imports: ['BaseJsonViewer'], script: `const small = ${literal(SMALL)}` }),
		},
	},
	args: { expandDepth: 2, hasToolbar: false },
	render: args => ({
		components: { BaseJsonViewer },
		setup: useStorySetup(args, { data: { small: SMALL } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('treeitem', { name: 'sku: "RUN-42"' })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Копировать JSON' })).toBeNull()
		await expect(canvas.getByRole('treeitem', { name: '"просто строка"' })).toBeVisible()
	},
}
