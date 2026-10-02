import { nodeHeader } from '../../shared'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { expandedIds: 'expandedIds' }

const template = `
	<div class="story-narrow">
		<BaseTree v-bind="args" v-model:expanded-ids="expandedIds">
			<template #icon="{ node }">
				<BaseIcon :name="node.children ? 'folder' : 'file'" :size-scale="80" style="color: var(--rise-text-muted);" />
			</template>
			<template #label="{ node }">
				<span style="display: inline-flex; align-items: center; gap: 8px;">
					{{ node.label }}
					<BaseBadge v-if="node.children" variant="outline" :label="String(node.children.length)" />
				</span>
			</template>
			<template #actions="{ node }">
				<BaseButton variant="ghost" :padding="{ x: 3, y: 3 }" :aria-label="'Скачать ' + node.label">
					<BaseIcon name="download" :size-scale="80" />
				</BaseButton>
			</template>
		</BaseTree>
	</div>
`

export const Slots: StoryObj<typeof meta> = {
	args: { expandedIds: ['src'] },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Слоты: `icon` — своя иконка (здесь одна для всех файлов), `label` — своя разметка метки (счётчик файлов у папки),',
					'`actions` — кнопки справа. Действия видны при наведении на строку и при фокусе на узле с клавиатуры;',
					'клик по ним не выбирает и не раскрывает узел. В порядке Tab — только действия текущего узла: Tab с узла переходит к ним.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTree', 'BaseBadge', 'BaseButton', 'BaseIcon'], models }),
		},
	},
	render: args => ({
		components: { BaseTree, BaseBadge, BaseButton, BaseIcon },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const header = nodeHeader(canvasElement, 'package.json')
		const actions = header.querySelector('.base-tree__actions') as HTMLElement
		await tabTo(canvasElement.querySelector('[role="treeitem"]') as HTMLElement, userEvent)
		await userEvent.keyboard('{End}{ArrowUp}')
		await expect(header).toHaveFocus()
		await waitFor(() => expect(getComputedStyle(actions).opacity).toBe('1'))
		await expect(nodeHeader(canvasElement, 'README.md').querySelector('button')).toHaveAttribute('tabindex', '-1')

		const folder = canvas.getByRole('treeitem', { name: /^public/ })
		await userEvent.keyboard('{ArrowUp}')
		await expect(folder).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Скачать public' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(folder).toHaveAttribute('aria-expanded', 'false')
		await userEvent.tab({ shift: true })
		await expect(folder).toHaveFocus()
	},
}
