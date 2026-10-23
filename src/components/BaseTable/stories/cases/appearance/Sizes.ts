import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { COMPACT_COLUMNS, toRows, ORDERS, tableScript } from '../../shared'
import { SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const columns = COMPACT_COLUMNS

const rows = toRows(ORDERS.slice(0, 3))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseTable v-bind="args" :size-scale="preset.sizeScale" :columns="columns" :rows="rows" />
		</div>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns }, { presets, rows }),
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { presets, columns, rows } }),
		template,
	}),
}
