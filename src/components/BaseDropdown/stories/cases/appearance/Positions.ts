import { docsFrame } from '../../shared'
import { BaseText } from '@components/BaseText'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'position', 'onUpdate:isOpen']

const positions = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; padding: 64px 0;">
		<BaseDropdown v-for="position in positions" :key="position" v-bind="args" :is-open="true" :position="position">
			<BaseButton variant="outline">{{ position }}</BaseButton>
			<template #dropdown>
				<BaseText style="padding: 6px 8px;">Панель</BaseText>
			</template>
		</BaseDropdown>
	</div>
`

export const Positions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'variant'] },
		docs: {
			description: {
				story: [
					'Позиция `position`: сторона (`top`, `bottom`, `left`, `right`) и выравнивание (`-start`, по центру, `-end`).',
					'Здесь — шесть позиций над и под триггером; `left-*` и `right-*` выбираются в Controls песочницы.',
				].join('\n'),
			},
			...docsFrame(260),
			source: storySource({
				template,
				imports: ['BaseDropdown', 'BaseButton', 'BaseText'],
				script: `const positions = ${literal(positions)} as const`,
				omit: HIDDEN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { positions }, slots: HIDDEN_ARGS }),
		template,
	}),
}
