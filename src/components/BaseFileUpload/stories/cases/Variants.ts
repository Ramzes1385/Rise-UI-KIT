import type meta from '../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseFileUpload from '../../ui/BaseFileUpload.vue'
import { FILE_UPLOAD_VARIANTS } from '../../types/BaseFileUpload.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Варианты зоны: `default` — пунктир; `outline` — сплошная рамка на прозрачном фоне; `soft` — мягкий фон без рамки;',
					'`ghost` — без рамки и фона (для плотных интерфейсов); `shadow` — приподнятая с тенью.',
				].join('\n'),
			},
			source: { code: FILE_UPLOAD_VARIANTS.map(variant => `<BaseFileUpload variant="${variant}" label="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label']), variants: FILE_UPLOAD_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px;">
				<BaseFileUpload v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
