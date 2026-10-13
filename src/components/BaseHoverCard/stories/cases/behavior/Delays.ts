import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const delays = [
	{ label: 'Сразу', openDelay: 0, closeDelay: 0 },
	{ label: 'Обычная', openDelay: 300, closeDelay: 150 },
	{ label: 'Медленная', openDelay: 800, closeDelay: 400 },
] as const

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'openDelay', 'closeDelay']

const template = `
	<div class="story-row" style="gap: 24px;">
		<BaseHoverCard v-for="delay in delays" :key="delay.label" v-bind="args" :open-delay="delay.openDelay" :close-delay="delay.closeDelay">
			<template #trigger>
				<BaseButton variant="outline">{{ delay.label }}</BaseButton>
			</template>
			<BaseText>Карточка: {{ delay.label }}. Открытие {{ delay.openDelay }} мс, закрытие {{ delay.closeDelay }} мс.</BaseText>
		</BaseHoverCard>
	</div>
`

export const Delays: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['position', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(180),
			description: {
				story: [
					'Задержки `openDelay` и `closeDelay`: «Сразу» (0 и 0 мс) открывает и закрывает карточку без ожидания, «Обычная» — 300 и 150 мс (по умолчанию),',
					'«Медленная» — 800 и 400 мс. Задержка открытия защищает от случайных наведений по пути курсора, задержка закрытия даёт перевести указатель на карточку.',
					'Фокус с клавиатуры открывает карточку сразу при любой задержке.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseHoverCard', 'BaseButton', 'BaseText'],
				script: `const delays = ${literal(delays)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { delays }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const instant = canvas.getByRole('button', { name: 'Сразу' })
		await userEvent.hover(instant)
		const instantCard = await screen.findByText(/Карточка: Сразу/)
		await waitFor(() => expect(instantCard).toBeVisible())
		await userEvent.unhover(instantCard)
		await waitFor(() => expect(screen.queryByText(/Карточка: Сразу/)).not.toBeInTheDocument())

		const slow = canvas.getByRole('button', { name: 'Медленная' })
		await userEvent.hover(slow)
		await expect(screen.queryByText(/Карточка: Медленная/)).not.toBeInTheDocument()
		const slowCard = await screen.findByText(/Карточка: Медленная/, undefined, { timeout: 2500 })
		await waitFor(() => expect(slowCard).toBeVisible())
		await userEvent.unhover(slowCard)
		await waitFor(() => expect(screen.queryByText(/Карточка: Медленная/)).not.toBeInTheDocument(), { timeout: 2500 })
	},
}
