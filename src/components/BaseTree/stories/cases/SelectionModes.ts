import { ref } from 'vue'
import { nodeHeader } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseTree.stories'
import BaseTree from '../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const SelectionModes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'arrowPosition'] },
		docs: {
			description: {
				story: [
					'Режимы выбора: `none` — клик только раскрывает папки; `single` — клик выбирает один узел (подсветка primary-soft);',
					'`multiple` — чекбоксы, выбор папки отмечает всё её содержимое. Под деревьями — значение `v-model:selected-ids`.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseTree :items="items" />',
					'<BaseTree v-model:selected-ids="selected" :items="items" selection-mode="single" />',
					'<BaseTree v-model:selected-ids="checked" :items="items" selection-mode="multiple" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: () => ({
			props: useArgsWithoutSlots(args, [
				'selectionMode',
				'expandedIds',
				'selectedIds',
				'onUpdate:expandedIds',
				'onUpdate:selectedIds',
			]),
			expandedNone: ref(['src']),
			expandedSingle: ref(['src']),
			expandedMultiple: ref(['src', 'composables']),
			single: ref(['app-vue']),
			multiple: ref(['composables', 'use-auth', 'use-api']),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">none</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedNone" />
				</div>
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">single</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedSingle" v-model:selected-ids="single" selection-mode="single" />
					<span class="story-label">Выбрано: {{ single.join(', ') || '—' }}</span>
				</div>
				<div class="story-stack" style="gap: 8px;">
					<span class="story-label">multiple</span>
					<BaseTree v-bind="props" v-model:expanded-ids="expandedMultiple" v-model:selected-ids="multiple" selection-mode="multiple" />
					<span class="story-label">Выбрано: {{ multiple.join(', ') || '—' }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [, singleTree, multipleTree] = canvas
			.getAllByText(/^(none|single|multiple)$/)
			.map(label => label.nextElementSibling as HTMLElement)
		await userEvent.click(nodeHeader(singleTree, 'package.json'))
		await expect(canvas.getByText('Выбрано: package-json')).toBeVisible()
		await expect(singleTree.querySelectorAll('.base-tree__node--selected')).toHaveLength(1)

		await expect(nodeHeader(singleTree, 'package.json')).toHaveAttribute('aria-selected', 'true')

		await userEvent.click(nodeHeader(multipleTree, 'public'))
		await expect(nodeHeader(multipleTree, 'public')).toHaveAttribute('aria-checked', 'true')
		await expect(canvas.getByText(/Выбрано: composables, use-auth, use-api, public, favicon, robots/)).toBeVisible()
		await expect(multipleTree.querySelectorAll('.base-tree__node--selected').length).toBeGreaterThan(1)
	},
}
