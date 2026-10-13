import { BaseText } from '@components/BaseText'
import { expect, screen } from 'storybook/test'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'maxHeight']

const template = `
	<BaseHoverCard v-bind="args" :is-open="true" max-height="140px">
		<template #trigger>
			<BaseButton variant="outline">Список изменений</BaseButton>
		</template>
		<BaseText v-for="n in 12" :key="n" style="display: block; margin-bottom: 8px;">Версия 2.{{ n }}: исправления доступности и мелкие улучшения интерфейса.</BaseText>
	</BaseHoverCard>
`

export const LongContent: StoryObj<typeof meta> = {
	args: { position: 'right' },
	parameters: {
		layout: 'padded',
		controls: { include: ['position', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(240),
			description: {
				story: 'Длинное содержимое: высота карточки ограничена `maxHeight` (здесь 140px, по умолчанию 320px), всё остальное прокручивается внутри. Длинные слова переносятся, а не растягивают карточку.',
			},
			source: storySource({ template, imports: ['BaseHoverCard', 'BaseButton', 'BaseText'], omit: OWN_ARGS }),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { slots: OWN_ARGS }),
		template,
	}),
	play: async () => {
		const inner = (await screen.findByText('Версия 2.1: исправления доступности и мелкие улучшения интерфейса.')).closest(
			'.base-hover-card__inner',
		) as HTMLElement
		await expect(inner.scrollHeight).toBeGreaterThan(inner.clientHeight)
		await expect(getComputedStyle(inner).overflowY).toBe('auto')
		await expect(inner.clientHeight).toBeLessThanOrEqual(140)
	},
}
