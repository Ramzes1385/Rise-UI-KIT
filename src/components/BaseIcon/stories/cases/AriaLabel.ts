import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import BaseIcon from '../../ui/BaseIcon.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const AriaLabel: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Декоративная иконка рядом с текстом скрыта от скринридера (`aria-hidden`): имя кнопки берётся из текста.',
					'Иконка без текста, которая несёт смысл, получает `ariaLabel` — становится изображением с доступным именем.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Скачать</BaseButton>',
					'<BaseIcon name="check-circle" color="var(--rise-success)" aria-label="Задача выполнена" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['name', 'ariaLabel', 'color']) }),
		template: `
			<div class="story-row">
				<BaseButton variant="outline">
					<template #left><BaseIcon v-bind="props" name="download" /></template>
					Скачать
				</BaseButton>
				<BaseIcon v-bind="props" name="check-circle" color="var(--rise-success)" aria-label="Задача выполнена" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Задача выполнена' })).toBeVisible()
		await expect(canvas.getByRole('button')).toHaveAccessibleName('Скачать')
	},
}
