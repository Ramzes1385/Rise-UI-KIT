import { expect } from 'storybook/test'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { BaseBadge } from '@components/BaseBadge'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { expandedIds: 'expandedIds' }

const template = `
	<div class="story-narrow">
		<BaseTree v-bind="args" v-model:expanded-ids="expandedIds">
			<template #label-main-ts="{ node }">
				<span style="display: inline-flex; align-items: center; gap: 8px;">
					{{ node.label }}
					<BaseBadge variant="soft" label="Точка входа" />
				</span>
			</template>
			<template #label-robots="{ node }">
				<span style="color: var(--rise-text-muted);">{{ node.label }} · не индексируется</span>
			</template>
		</BaseTree>
	</div>
`

export const LabelById: StoryObj<typeof meta> = {
	args: { expandedIds: ['src', 'public'] },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Метка одного узла — слот `label-<id>` на любой глубине: `label-main-ts` для узла `main-ts`,',
					'`label-robots` — для файла во вложенной папке. Остальные узлы — слот `label` или метка по умолчанию.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBadge', 'BaseTree'], models }),
		},
	},
	render: args => ({
		components: { BaseTree, BaseBadge },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Точка входа')).toBeVisible()
		await expect(canvas.getByText('robots.txt · не индексируется')).toBeVisible()
		await expect(canvas.getByText('App.vue')).toBeVisible()
	},
}
