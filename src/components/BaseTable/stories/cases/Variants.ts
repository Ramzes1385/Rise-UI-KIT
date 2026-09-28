import type meta from '../BaseTable.stories'
import BaseTable from '../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { COMPACT_COLUMNS, toRows, ORDERS } from '../shared'
import { TABLE_VARIANTS } from '../../types/BaseTable.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'features', 'behavior'] },
		docs: {
			description: {
				story: [
					'Три варианта: `default` — линии между строками, `bordered` — ещё и между колонками (плотные данные, сравнение значений),',
					'`striped` — чётные строки на фоне `bg-muted` вместо линий (длинные строки легче вести глазом).',
				].join('\n'),
			},
			source: {
				code: TABLE_VARIANTS.map(variant => `<BaseTable :columns="columns" :rows="rows" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			variants: TABLE_VARIANTS,
			columns: COMPACT_COLUMNS,
			rows: toRows(ORDERS.slice(0, 4)),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTable v-bind="props" :variant="variant" :columns="columns" :rows="rows" />
				</div>
			</div>
		`,
	}),
}
