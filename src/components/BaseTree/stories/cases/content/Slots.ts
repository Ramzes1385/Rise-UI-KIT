import { nodeHeader } from '../../shared'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Slots: StoryObj<typeof meta> = {
	args: { expandedIds: ['src'] },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Слоты: `icon` — своя иконка (здесь одна для всех файлов), `label` — своя разметка метки (счётчик файлов у папки),',
					'`actions` — кнопки справа. Действия видны при наведении на строку и при фокусе на узле с клавиатуры.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseTree :items="items">',
					`  <template #icon="{ node }"><BaseIcon :name="node.children ? 'folder' : 'file'" /></template>`,
					'  <template #label="{ node }">{{ node.label }} <BaseBadge v-if="node.children" :label="node.children.length" /></template>',
					'  <template #actions="{ node }">',
					'    <BaseButton variant="ghost" :padding="{ x: 3, y: 3 }" :aria-label="`Скачать ${node.label}`" @click.stop>',
					'      <BaseIcon name="download" :size-scale="80" />',
					'    </BaseButton>',
					'  </template>',
					'</BaseTree>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onExpanded = useModelArg('expandedIds')
		return {
			components: { BaseTree, BaseBadge, BaseButton, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onExpanded }),
			template: `
				<div class="story-narrow">
					<BaseTree v-bind="props" @update:expanded-ids="onExpanded">
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
							<BaseButton variant="ghost" :padding="{ x: 3, y: 3 }" :aria-label="'Скачать ' + node.label" @click.stop>
								<BaseIcon name="download" :size-scale="80" />
							</BaseButton>
						</template>
					</BaseTree>
				</div>
			`,
		}
	},
	play: async ({ canvasElement, userEvent }) => {
		const header = nodeHeader(canvasElement, 'package.json')
		const actions = header.querySelector('.base-tree__actions') as HTMLElement
		await tabTo(canvasElement.querySelector('[role="treeitem"]') as HTMLElement, userEvent)
		await userEvent.keyboard('{End}{ArrowUp}')
		await expect(header).toHaveFocus()
		await waitFor(() => expect(getComputedStyle(actions).opacity).toBe('1'))
	},
}
