import { BaseIcon } from '@components/BaseIcon'
import { docsFrame, CENTERED } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { screen, expect, waitFor } from 'storybook/test'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { color: 'modelValue' }

const state = { isNone: false }

const template = `
	<div style="${CENTERED}">
		<BaseColorPicker
			v-bind="args"
			v-model="color"
			:has-transparent-swatch="isNone"
			@update:model-value="isNone = false"
			@reset="isNone = true">
			<template #trigger>
				<BaseIcon v-if="isNone" name="minus" :size-scale="80" />
			</template>
		</BaseColorPicker>
	</div>
`

export const Resettable: StoryObj<typeof meta> = {
	args: { isResettable: true, modelValue: '#15803d' },
	parameters: {
		docs: {
			...docsFrame(380),
			description: {
				story: 'Сброс цвета (`isResettable`): кнопка «Без цвета» эмитит `reset` и закрывает панель; здесь сброс убирает заливку образца.',
			},
			source: storySource({ template, imports: ['BaseColorPicker', 'BaseIcon'], models, state }),
		},
	},
	render: args => ({
		components: { BaseColorPicker, BaseIcon },
		setup: useStorySetup(args, { models, state, slots: [] }),
		template,
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
