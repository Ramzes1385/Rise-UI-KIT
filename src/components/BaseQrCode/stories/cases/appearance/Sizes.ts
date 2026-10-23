import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const sizes = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, caption: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-end">
		<figure v-for="item in sizes" :key="item.name" style="margin: 0; text-align: center">
			<BaseQrCode v-bind="args" :size="120" :size-scale="item.sizeScale" :label="\`QR-код, размер \${item.name}\`" />
			<figcaption class="story-label">{{ item.caption }}</figcaption>
		</figure>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% от `size` 120px.' },
			source: storySource({
				template,
				imports: ['BaseQrCode'],
				script: `const sizes = ${literal(sizes)}`,
				omit: ['size', 'sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { sizes } }),
		template,
	}),
}
