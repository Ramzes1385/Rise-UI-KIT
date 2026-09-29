import { docsFrame } from '../../shared'
import { screen, expect } from 'storybook/test'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	parameters: {
		controls: { include: ['color', 'position'] },
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст панели, стрелка того же цвета. Подойдёт любой CSS-цвет; токены `var(--rise-…)`',
					'сохраняют контраст в обеих темах. Содержимое `color` не наследует — кнопка «Включить» сохраняет свой цвет.',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BasePopover, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<BasePopover v-bind="props" @update:is-open="onUpdate">
					<template #trigger>
						<BaseButton variant="outline">Новое в редакторе</BaseButton>
					</template>
					<div class="story-col">
						Субтитры теперь можно сдвигать горячими клавишами.
						<BaseButton>Включить</BaseButton>
					</div>
				</BasePopover>
			`,
		}
	},
	play: async () => {
		const action = await screen.findByRole('button', { name: 'Включить' })
		const panel = action.closest('.base-dropdown__panel') as HTMLElement
		const arrow = panel.querySelector('.base-popover__arrow') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(arrow).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}
