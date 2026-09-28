import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseSwitch.stories'
import BaseSwitch from '../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Slots: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Слот `label` заменяет подпись своей разметкой, слот `default` добавляет текст после подписи.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'onUpdate:modelValue']), isDark: ref(false) }),
		template: `
			<BaseSwitch v-bind="props" v-model="isDark">
				<template #label><strong>Тёмная тема</strong></template>
				<span style="display: block; color: var(--rise-text-muted);">Применится ко всем устройствам аккаунта</span>
			</BaseSwitch>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: /Тёмная тема/ })
		await userEvent.click(canvas.getByText('Тёмная тема'))
		await expect(toggle).toBeChecked()
	},
}
