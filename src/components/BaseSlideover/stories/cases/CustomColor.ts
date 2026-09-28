import { SHOWCASE_OWN_ARGS } from '../shared'
import { expect, within } from 'storybook/test'
import type meta from '../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../ui/BaseSlideover.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
		title: 'Заметки к серии',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст панели. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют контраст',
					'в обеих темах. Компоненты в теле и подвале `color` не наследуют — кнопка «Сохранить» сохраняет свой цвет.',
				].join('\n'),
			},
		},
		controls: { include: ['color', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSlideover, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]) }),
		template: `
			<div class="story-frame" style="height: 260px;">
				<BaseSlideover v-bind="props" :is-open="true" is-contained title="Заметки к серии">
					Перезаписать реплики 12–15: в оригинале пауза длиннее.
					<template #footer>
						<BaseButton>Сохранить</BaseButton>
					</template>
				</BaseSlideover>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const dialog = canvas.getByRole('dialog', { name: 'Заметки к серии' })
		await expect(getComputedStyle(dialog).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(dialog).color).toBe(resolveColor('var(--rise-primary-text)'))
		const save = within(dialog).getByRole('button', { name: 'Сохранить' })
		await expect(getComputedStyle(save).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}
