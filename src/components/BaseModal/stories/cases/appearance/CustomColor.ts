import type meta from '../../BaseModal.stories'
import { expect, within } from 'storybook/test'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { resolveColor, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-frame story-medium" style="height: 280px;">
		<BaseModal v-bind="args" :is-open="true" is-contained title="Годовая подписка">
			Два месяца в подарок при оплате за год. Подписку можно отменить в любой момент.
			<template #footer>
				<BaseButton>Оформить</BaseButton>
			</template>
		</BaseModal>
	</div>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		title: 'Годовая подписка',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст окна, фон кнопки закрытия при наведении (`bg.hover`). Подойдёт любой CSS-цвет;',
					'токены `var(--rise-…)` сохраняют контраст в обеих темах. Компоненты в теле и подвале `color` не наследуют —',
					'кнопка «Оформить» сохраняет свой цвет.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseModal', 'BaseButton'], omit: [...SHOWCASE_OWN_ARGS] }),
		},
		controls: { include: ['color', 'variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseModal, BaseButton },
		setup: useStorySetup(args, { slots: [...SHOWCASE_OWN_ARGS] }),
		template,
	}),
	play: async ({ canvas }) => {
		const dialog = canvas.getByRole('dialog', { name: 'Годовая подписка' })
		await expect(getComputedStyle(dialog).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(dialog).color).toBe(resolveColor('var(--rise-primary-text)'))
		const action = within(dialog).getByRole('button', { name: 'Оформить' })
		await expect(getComputedStyle(action).backgroundColor).toBe(resolveColor('var(--rise-primary)'))
	},
}
