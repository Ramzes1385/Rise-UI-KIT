import { docsFrame } from '../../shared'
import { screen, expect } from 'storybook/test'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

const models = { isOpen: 'isOpen' }

const template = `
	<BaseDropdown v-bind="args" v-model:is-open="isOpen">
		<BaseButton variant="outline" @click="isOpen = !isOpen">Загрузки</BaseButton>
		<template #dropdown>
			<div class="story-col" style="padding: 8px;">
				Готово к скачиванию: 3 файла
				<BaseButton>Скачать всё</BaseButton>
			</div>
		</template>
	</BaseDropdown>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	parameters: {
		controls: { include: ['color', 'variant'] },
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст панели. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют контраст',
					'в обеих темах. Содержимое панели `color` не наследует — кнопка «Скачать всё» сохраняет свой цвет.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDropdown', 'BaseButton'], models }),
		},
	},
	render: args => ({
		components: { BaseDropdown, BaseButton },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		const action = await screen.findByRole('button', { name: 'Скачать всё' })
		const panel = action.closest('.base-dropdown__panel') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}
