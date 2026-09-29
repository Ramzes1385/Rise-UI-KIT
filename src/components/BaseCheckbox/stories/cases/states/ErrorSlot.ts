import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const ErrorSlot: StoryObj<typeof meta> = {
	args: { label: 'Принимаю условия оферты', error: 'Нужно согласие с условиями' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `error` заменяет текст ошибки своей разметкой — например, ссылкой на документ.',
					'Чекбокс описан содержимым слота через `aria-describedby` так же, как обычным текстом ошибки.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']), checked: ref(false) }),
		template: `
			<BaseCheckbox v-bind="props" v-model="checked">
				<template #error>
					<span style="padding-left: 24px; color: var(--rise-error); font-size: 14px; line-height: 20px;">
						Прочитайте <a href="#offer" style="color: inherit;">условия оферты</a> и отметьте согласие
					</span>
				</template>
			</BaseCheckbox>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'условия оферты' })).toHaveAttribute('href', '#offer')
		await expect(canvas.queryByText('Нужно согласие с условиями')).toBeNull()
		await expect(canvas.getByRole('checkbox', { name: 'Принимаю условия оферты' })).toHaveAccessibleDescription(
			'Прочитайте условия оферты и отметьте согласие',
		)
	},
}
