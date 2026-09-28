import { ref } from 'vue'
import { docsFrame, CENTERED } from '../shared'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BaseColorPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, expect, waitFor } from 'storybook/test'
import BaseColorPicker from '../../ui/BaseColorPicker.vue'

export const Resettable: StoryObj<typeof meta> = {
	args: { isResettable: true, modelValue: '#15803d' },
	parameters: {
		docs: {
			...docsFrame(380),
			description: {
				story: 'Сброс цвета (`isResettable`): кнопка «Без цвета» эмитит `reset` и закрывает панель; здесь сброс убирает заливку образца.',
			},
		},
	},
	render: args => ({
		components: { BaseColorPicker, BaseIcon },
		setup: () => {
			const color = ref(String(args.modelValue))
			const isNone = ref(false)
			return { props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']), color, isNone, centered: CENTERED }
		},
		template: `
			<div :style="centered">
				<BaseColorPicker
					v-bind="props"
					v-model="color"
					:has-transparent-swatch="isNone"
					@update:model-value="isNone = false"
					@reset="isNone = true">
					<template #trigger>
						<BaseIcon v-if="isNone" name="minus" :size-scale="80" />
					</template>
				</BaseColorPicker>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		await userEvent.click(await screen.findByRole('button', { name: 'Без цвета' }))
		await expect(args.onReset).toHaveBeenCalledOnce()
		await waitFor(() => expect(swatch.style.backgroundColor).toBe(''))
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Без цвета' })).not.toBeInTheDocument())
	},
}
