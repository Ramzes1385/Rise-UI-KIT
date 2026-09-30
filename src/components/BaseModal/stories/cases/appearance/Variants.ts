import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import BaseModal from '../../../ui/BaseModal.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { MODAL_VARIANTS } from '../../../types/BaseModal.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = MODAL_VARIANTS

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'variant']

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<div v-for="variant in variants" :key="variant" class="story-frame" style="height: 240px;">
			<BaseModal v-bind="args" :is-open="true" is-contained :variant="variant" :title="variant">
				<BaseText>Окно открыто внутри рамки и не выходит за её границы.</BaseText>
			</BaseModal>
		</div>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseModal', 'BaseText'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
}
