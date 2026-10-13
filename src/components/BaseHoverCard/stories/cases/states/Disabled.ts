import { BaseLink } from '@components/BaseLink'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseHoverCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'openDelay']

const template = `
	<div class="story-row" style="gap: 32px;">
		<BaseHoverCard v-bind="args" :open-delay="0">
			<template #trigger>
				<BaseLink href="#disabled" label="Карточка отключена" />
			</template>
			<BaseText>Эта карточка не откроется</BaseText>
		</BaseHoverCard>
		<BaseHoverCard v-bind="args" :open-delay="0" :is-disabled="false">
			<template #trigger>
				<BaseLink href="#enabled" label="Карточка включена" />
			</template>
			<BaseText>Эта карточка откроется</BaseText>
		</BaseHoverCard>
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: { isDisabled: true },
	parameters: {
		controls: { include: ['isDisabled', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Отключённая карточка (`isDisabled`) не открывается ни наведением, ни фокусом, а открытая закрывается. Ссылка-триггер при этом остаётся рабочей.',
					'Рядом — включённая карточка для сравнения (в обоих `openDelay` равен 0, чтобы отличие было видно сразу).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseHoverCard', 'BaseLink', 'BaseText'], omit: OWN_ARGS }),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseLink, BaseText },
		setup: useStorySetup(args, { slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const disabled = canvas.getByRole('link', { name: 'Карточка отключена' })
		await userEvent.hover(disabled)
		await expect(screen.queryByText('Эта карточка не откроется')).not.toBeInTheDocument()
		await userEvent.unhover(disabled)

		await tabTo(disabled, userEvent)
		await expect(screen.queryByText('Эта карточка не откроется')).not.toBeInTheDocument()

		const enabled = canvas.getByRole('link', { name: 'Карточка включена' })
		await userEvent.hover(enabled)
		const text = await screen.findByText('Эта карточка откроется')
		await waitFor(() => expect(text).toBeVisible())
	},
}
