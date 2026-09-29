import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSlideover from '../../../ui/BaseSlideover.vue'

export const Widths: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['side', 'sizeScale'] },
		docs: {
			description: { story: 'Ширина: `width` — проценты от 420px (здесь 75 и 100), `isFullWidth` — на всю ширину, без скругления.' },
			source: {
				code: [
					'<BaseSlideover v-model:is-open="isOpen" :width="75" title="75%">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" title="100%">…</BaseSlideover>',
					'<BaseSlideover v-model:is-open="isOpen" is-full-width title="На всю ширину">…</BaseSlideover>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'width', 'isFullWidth']),
			widths: [
				{ title: '75%', width: 75, isFullWidth: false },
				{ title: '100% — 420px', width: 100, isFullWidth: false },
				{ title: 'На всю ширину', width: 100, isFullWidth: true },
			],
		}),
		template: `
			<div class="story-stack">
				<div v-for="item in widths" :key="item.title" class="story-frame" style="height: 160px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :width="item.width" :is-full-width="item.isFullWidth" :title="item.title">
						<BaseText>Содержимое панели.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}
