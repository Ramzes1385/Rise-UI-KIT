import { docsFrame } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: { code: '<BaseDropdown v-model:is-open="isOpen" position="top-end">…</BaseDropdown>' },
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['isOpen', 'position', 'onUpdate:isOpen']),
			positions: ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px; padding: 64px 0;">
				<BaseDropdown v-for="position in positions" :key="position" v-bind="props" :is-open="true" :position="position">
					<BaseButton variant="outline">{{ position }}</BaseButton>
					<template #dropdown>
						<BaseText style="padding: 6px 8px;">Панель</BaseText>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}
