import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import BaseIcon from '../../ui/BaseIcon.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseButton variant="outline">
			<template #left><BaseIcon v-bind="args" name="download" /></template>
			Скачать
		</BaseButton>
		<BaseIcon v-bind="args" name="check-circle" color="var(--rise-success)" aria-label="Задача выполнена" />
	</div>
`

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
			source: storySource({ template, imports: ['BaseIcon', 'BaseButton'], omit: ['name', 'ariaLabel', 'color'] }),
		},
	},
	render: args => ({
		components: { BaseIcon, BaseButton },
		setup: useStorySetup(args, { slots: ['name', 'ariaLabel', 'color'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Задача выполнена' })).toBeVisible()
		await expect(canvas.getByRole('button')).toHaveAccessibleName('Скачать')
	},
}
