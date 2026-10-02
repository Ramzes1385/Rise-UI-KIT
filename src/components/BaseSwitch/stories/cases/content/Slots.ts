import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isDark: false }

const template = `
	<BaseSwitch v-bind="args" v-model="isDark">
		<template #label><strong>Тёмная тема</strong></template>
		<span style="display: block; color: var(--rise-text-muted);">Применится ко всем устройствам аккаунта</span>
	</BaseSwitch>
`

export const Slots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `label` заменяет подпись своей разметкой. Слот `default` — описание: оно не входит в имя переключателя,',
					'а связано с ним через `aria-describedby`; клик по описанию тоже переключает. Без `label` и слота `label`',
					'содержимое `default` становится подписью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				state,
				omit: ['default', 'modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, { state, slots: ['default', 'modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Тёмная тема' })
		await expect(toggle).toHaveAccessibleDescription('Применится ко всем устройствам аккаунта')
		await userEvent.click(canvas.getByText('Тёмная тема'))
		await expect(toggle).toBeChecked()
		await userEvent.click(canvas.getByText('Применится ко всем устройствам аккаунта'))
		await expect(toggle).not.toBeChecked()
		toggle.focus()
		await userEvent.keyboard(' ')
		await expect(toggle).toBeChecked()
	},
}
