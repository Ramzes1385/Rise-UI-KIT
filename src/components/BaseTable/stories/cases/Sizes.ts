import type meta from '../BaseTable.stories'
import BaseTable from '../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { COMPACT_COLUMNS, toRows, ORDERS } from '../shared'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { behavior: { selectable: true } },
	parameters: {
		controls: { include: ['variant', 'behavior'] },
		docs: {
			description: {
				story: [
					'Размер задаёт `sizeScale`: кегль, отступы ячеек, чекбоксы и поля тулбара масштабируются вместе.',
					'При 100 строка — 44px, поля и кнопки тулбара — 32px, как остальные контролы библиотеки.',
				].join('\n'),
			},
			source: {
				code: ['xs', 'md', 'xl']
					.map(
						name =>
							`<BaseTable :columns="columns" :rows="rows" :size-scale="${SIZE_PRESETS.find(p => p.name === name)?.sizeScale}" />`,
					)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
			columns: COMPACT_COLUMNS,
			rows: toRows(ORDERS.slice(0, 3)),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTable v-bind="props" :size-scale="preset.sizeScale" :columns="columns" :rows="rows" />
				</div>
			</div>
		`,
	}),
}
