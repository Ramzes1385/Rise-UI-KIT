import type meta from '../BaseModal.stories'
import { SHOWCASE_OWN_ARGS } from '../shared'
import BaseModal from '../../ui/BaseModal.vue'
import { BaseText } from '@components/BaseText'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { MODAL_VARIANTS } from '../../types/BaseModal.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'hasOverlay'] },
		docs: {
			description: {
				story: [
					'Три варианта. `default` — рамка и тень; `shadow` — только тень; `ghost` — без фона, рамки и тени,',
					'когда оформление даёт содержимое (изображение, своя карточка). Окна открыты внутри рамок (`isContained`).',
				].join('\n'),
			},
			source: {
				code: MODAL_VARIANTS.map(
					variant => `<BaseModal v-model:is-open="isOpen" variant="${variant}" title="${variant}">…</BaseModal>`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'variant']), variants: MODAL_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<div v-for="variant in variants" :key="variant" class="story-frame" style="height: 240px;">
					<BaseModal v-bind="props" :is-open="true" is-contained :variant="variant" :title="variant">
						<BaseText>Окно открыто внутри рамки и не выходит за её границы.</BaseText>
					</BaseModal>
				</div>
			</div>
		`,
	}),
}
