import { docsFrame } from '../../shared'
import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseHoverCard v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseAvatar name="Анна Смирнова" />
		</template>
		<div class="story-col" style="width: 240px;">
			<div class="story-row" style="flex-wrap: nowrap;">
				<BaseAvatar name="Анна Смирнова" :size-scale="125" />
				<div>
					<div style="font-weight: 600;">Анна Смирнова</div>
					<BaseText>Дизайнер продукта · Москва</BaseText>
				</div>
			</div>
			<BaseText>Ведёт дизайн-систему и ревью макетов. В команде с 2021 года.</BaseText>
			<BaseButton variant="outline">Написать</BaseButton>
		</div>
	</BaseHoverCard>
`

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const Profile: StoryObj<typeof meta> = {
	args: { isOpen: true, position: 'bottom-start' },
	parameters: {
		controls: { include: ['position', 'variant', 'openDelay', 'closeDelay', 'sizeScale'] },
		docs: {
			...docsFrame(240),
			description: {
				story: [
					'Карточка профиля: аватар в роли триггера, в карточке — имя, должность, описание и кнопка. Указатель можно перевести с аватара на саму карточку,',
					'чтобы нажать кнопку: пока он на карточке, она не закрывается. Аватар не фокусируется сам, поэтому карточка выдаёт ему `tabindex="0"`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseHoverCard', 'BaseAvatar', 'BaseButton', 'BaseText'], models }),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseAvatar, BaseButton, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const trigger = canvasElement.querySelector('.base-hover-card__trigger > *') as HTMLElement
		await expect(trigger).toHaveAttribute('tabindex', '0')
		const description = await screen.findByText(/Ведёт дизайн-систему/)
		const button = screen.getByRole('button', { name: 'Написать' })

		await userEvent.hover(trigger)
		await userEvent.unhover(trigger)
		await userEvent.hover(button)
		await sleep(400)
		await expect(description).toBeVisible()

		await userEvent.unhover(button)
		await waitFor(() => expect(screen.queryByText(/Ведёт дизайн-систему/)).not.toBeInTheDocument())
	},
}
