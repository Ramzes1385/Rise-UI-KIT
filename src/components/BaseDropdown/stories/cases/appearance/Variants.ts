import { BaseText } from '@components/BaseText'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { DROPDOWN_VARIANTS } from '../../../types/BaseDropdown.types'
import { storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'variant', 'onUpdate:isOpen']

const template = `
	<div class="story-grid" style="--story-grid-min: 140px;">
		<div v-for="variant in DROPDOWN_VARIANTS" :key="variant" style="height: 110px;">
			<BaseDropdown v-bind="args" :is-open="true" :variant="variant">
				<BaseButton variant="outline">{{ variant }}</BaseButton>
				<template #dropdown>
					<BaseText style="padding: 6px 8px;">Панель {{ variant }}</BaseText>
				</template>
			</BaseDropdown>
		</div>
	</div>
`

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
			source: storySource({ template, imports: ['BaseDropdown', 'BaseButton', 'BaseText', 'DROPDOWN_VARIANTS'], omit: HIDDEN_ARGS }),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { DROPDOWN_VARIANTS }, slots: HIDDEN_ARGS }),
		template,
	}),
}
