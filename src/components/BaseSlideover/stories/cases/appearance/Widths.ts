import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const widths = [
	{ title: '75%', width: 75, isFullWidth: false },
	{ title: '100% — 420px', width: 100, isFullWidth: false },
	{ title: 'На всю ширину', width: 100, isFullWidth: true },
]

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'width', 'isFullWidth']

const template = `
	<div class="story-stack">
		<div v-for="item in widths" :key="item.title" class="story-frame" style="height: 160px;">
			<BaseSlideover v-bind="args" :is-open="true" is-contained :width="item.width" :is-full-width="item.isFullWidth" :title="item.title">
				<BaseText>Содержимое панели.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Widths: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['side', 'sizeScale'] },
		docs: {
			description: { story: 'Ширина: `width` — проценты от 420px (здесь 75 и 100), `isFullWidth` — на всю ширину, без скругления.' },
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const widths = ${literal(widths)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { widths }, slots: OWN_ARGS }),
		template,
	}),
}
