import { computed } from 'vue'
import { docsFrame } from '../../shared'
import { screen, expect } from 'storybook/test'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
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
		controls: { include: ['color', 'variant'] },
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст панели. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют контраст',
					'в обеих темах. Содержимое панели `color` не наследует — кнопка «Скачать всё» сохраняет свой цвет.',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Загрузки</BaseButton>
					<template #dropdown>
						<div class="story-col" style="padding: 8px;">
							Готово к скачиванию: 3 файла
							<BaseButton>Скачать всё</BaseButton>
						</div>
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		const action = await screen.findByRole('button', { name: 'Скачать всё' })
		const panel = action.closest('.base-dropdown__panel') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}
