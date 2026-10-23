import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TABLE_VARIANTS } from '../../../types/BaseTable.types'
import { COMPACT_COLUMNS, toRows, ORDERS, tableScript } from '../../shared'

const columns = COMPACT_COLUMNS

const rows = toRows(ORDERS.slice(0, 4))

const template = `
	<div class="story-stack">
		<div v-for="variant in TABLE_VARIANTS" :key="variant" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ variant }}</span>
			<BaseTable v-bind="args" :variant="variant" :columns="columns" :rows="rows" />
		</div>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseTable', 'TABLE_VARIANTS', 'type TableColumn'],
				script: tableScript({ columns }, { rows }),
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { TABLE_VARIANTS, columns, rows } }),
		template,
	}),
}
