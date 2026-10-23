import { ITEMS } from '../../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div class="story-narrow">
		<BaseBottomNav v-bind="args" v-model="active">
			<template #icon="{ item, isActive }">
				<BaseIcon :name="isActive ? 'check-circle' : item.icon" :size-scale="140" />
			</template>
			<template #label="{ item, isActive }">
				<strong v-if="isActive">{{ item.label }}</strong>
				<template v-else>{{ item.label }}</template>
			</template>
		</BaseBottomNav>
	</div>
`

export const CustomSlots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слоты `icon` и `label` получают пункт и `isActive`: свой значок (здесь — галочка у выбранного пункта; так же ставят аватар профиля) и своя подпись.',
			},
			source: storySource({ template, imports: ['BaseBottomNav', 'BaseIcon'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseBottomNav, BaseIcon },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas }) => {
		const home = canvas.getByRole('button', { name: ITEMS[0]!.label })
		await expect(home.querySelector('strong')).not.toBeNull()
	},
}
