import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BasePromptInput.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePromptInput from '../../ui/BasePromptInput.vue'

export const WithToolbar: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слоты `start` и `end`: вложения и выбор модели слева, голосовой ввод справа; поле с подписью.' },
		},
	},
	args: { label: 'Вопрос по документации', modelValue: 'Сравни BaseDrawer и BaseSlideover:\n— когда что брать;\n— доступность.' },
	render: args => ({
		components: { BasePromptInput, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div style="max-width: 640px">
				<BasePromptInput v-bind="props">
					<template #start>
						<BaseButton variant="ghost" aria-label="Прикрепить файл" :padding="{ x: 6, y: 6 }"><BaseIcon name="attach" /></BaseButton>
						<BaseButton variant="ghost" :size-scale="87.5">
							Rise 2
							<template #right><BaseIcon name="chevron-down" /></template>
						</BaseButton>
					</template>
					<template #end>
						<BaseButton variant="ghost" aria-label="Голосовой ввод" :padding="{ x: 6, y: 6 }"><BaseIcon name="mic" /></BaseButton>
					</template>
				</BasePromptInput>
			</div>`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Вопрос по документации' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Прикрепить файл' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Отправить' })).toBeEnabled()
	},
}
