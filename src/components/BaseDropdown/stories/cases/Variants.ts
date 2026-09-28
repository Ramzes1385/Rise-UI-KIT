import { docsFrame } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { DROPDOWN_VARIANTS } from '../../types/BaseDropdown.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'position'] },
		docs: {
			description: {
				story: [
					'Пять вариантов панели. `default` — рамка и тень; `outline` — рамка заметнее, без тени; `shadow` — только тень;',
					'`soft` — мягкий нейтральный фон; `ghost` — без фона, рамки и тени, когда оформление даёт содержимое.',
				].join('\n'),
			},
			...docsFrame(200),
			source: {
				code: DROPDOWN_VARIANTS.map(variant => `<BaseDropdown v-model:is-open="isOpen" variant="${variant}">…</BaseDropdown>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, ['isOpen', 'variant', 'onUpdate:isOpen']), variants: DROPDOWN_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 140px;">
				<div v-for="variant in variants" :key="variant" style="height: 110px;">
					<BaseDropdown v-bind="props" :is-open="true" :variant="variant">
						<BaseButton variant="outline">{{ variant }}</BaseButton>
						<template #dropdown>
							<BaseText style="padding: 6px 8px;">Панель {{ variant }}</BaseText>
						</template>
					</BaseDropdown>
				</div>
			</div>
		`,
	}),
}
