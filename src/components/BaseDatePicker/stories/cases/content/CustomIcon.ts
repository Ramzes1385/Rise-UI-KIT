import { ref } from 'vue'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'

export const CustomIcon: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `icon` заменяет кнопку календаря в поле своим содержимым; панель по-прежнему открывается кликом по полю.',
			},
			source: {
				code: '<BaseDatePicker v-model="date" label="Дата встречи">\n  <template #icon><BaseIcon name="chevron-down" /></template>\n</BaseDatePicker>',
			},
		},
	},
	render: args => ({
		components: { BaseDatePicker, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue']), value: ref<Date | null>(null) }),
		template: `
			<div class="story-narrow">
				<BaseDatePicker v-bind="props" v-model="value">
					<template #icon>
						<span style="display: flex; padding: 0 4px; color: var(--rise-text-muted);" aria-hidden="true">
							<BaseIcon name="chevron-down" :size-scale="80" />
						</span>
					</template>
				</BaseDatePicker>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Открыть календарь' })).not.toBeInTheDocument()
	},
}
