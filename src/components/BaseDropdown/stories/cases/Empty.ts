import { docsFrame } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, screen } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseDropdown v-bind="args" v-model:is-open="isOpen">
		<BaseButton variant="outline" @click="isOpen = !isOpen">Недавние</BaseButton>
		<template #dropdown>
			<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }" style="padding: 6px 8px;">
				Вы ещё не открывали проекты
			</BaseText>
		</template>
	</BaseDropdown>
`

export const Empty: StoryObj<typeof meta> = {
	args: { isOpen: true },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			...docsFrame(160),
			description: { story: 'Пустая панель: вместо пунктов — короткое пояснение приглушённым текстом.' },
			source: storySource({ template, imports: ['BaseDropdown', 'BaseButton', 'BaseText'], models }),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		await waitFor(() => expect(screen.getByText('Вы ещё не открывали проекты')).toBeVisible())
	},
}
