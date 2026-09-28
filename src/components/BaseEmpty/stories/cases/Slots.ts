import { expect } from 'storybook/test'
import type meta from '../BaseEmpty.stories'
import BaseEmpty from '../../ui/BaseEmpty.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, placeholderImage } from '@/stories/helpers'

export const Slots: StoryObj<typeof meta> = {
	args: { title: 'Нет загруженных файлов', description: 'Перетащите файлы сюда или выберите их на компьютере.' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Слоты: `icon` — своя иллюстрация вместо иконки, по умолчанию — дополнительный текст под описанием,',
					'`actions` — кнопки следующего шага.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseEmpty title="Нет загруженных файлов" description="…">',
					'  <template #icon><img :src="illustration" alt="" /></template>',
					'  Поддерживаются PDF, DOCX и XLSX до 20 МБ.',
					'  <template #actions>',
					'    <BaseButton>Выбрать файлы</BaseButton>',
					'    <BaseButton variant="outline">Создать папку</BaseButton>',
					'  </template>',
					'</BaseEmpty>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), illustration: placeholderImage({ width: 160, height: 100, hue: 200 }) }),
		template: `
			<div class="story-medium">
				<BaseEmpty v-bind="props">
					<template #icon>
						<img :src="illustration" alt="" width="160" height="100" style="border-radius: var(--rise-radius-md);" />
					</template>
					Поддерживаются PDF, DOCX и XLSX до 20 МБ.
					<template #actions>
						<BaseButton><template #left><BaseIcon name="attach" /></template>Выбрать файлы</BaseButton>
						<BaseButton variant="outline">Создать папку</BaseButton>
					</template>
				</BaseEmpty>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Поддерживаются PDF, DOCX и XLSX до 20 МБ.')).toBeVisible()
		const [primary, secondary] = canvas.getAllByRole('button')
		await expect(primary).toHaveAccessibleName('Выбрать файлы')
		await expect(secondary).toHaveAccessibleName('Создать папку')
	},
}
