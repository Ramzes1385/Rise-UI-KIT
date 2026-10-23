import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { value: null }

const template = `
	<div class="story-narrow">
		<BaseDatePicker v-bind="args" v-model="value">
			<template #icon>
				<span style="display: flex; padding: 0 4px; color: var(--rise-text-muted);" aria-hidden="true">
					<BaseIcon name="chevron-down" :size-scale="80" />
				</span>
			</template>
		</BaseDatePicker>
	</div>
`

export const CustomIcon: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `icon` заменяет кнопку календаря в поле своим содержимым; панель по-прежнему открывается кликом по полю.',
			},
			source: storySource({
				template,
				imports: ['BaseDatePicker', 'BaseIcon'],
				state,
				types: { value: 'Date | null' },
				omit: ['modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDatePicker, BaseIcon },
		setup: useStorySetup(args, { state, slots: ['modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Открыть календарь' })).not.toBeInTheDocument()
	},
}
