import { BaseLink } from '@components/BaseLink'
import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { literal, placeholderImage, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const preview = placeholderImage({ width: 320, height: 180, hue: 210 })

const template = `
	<BaseHoverCard v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseLink href="#tokens" label="Руководство по токенам" />
		</template>
		<div class="story-col" style="width: 260px;">
			<img :src="preview" alt="Обложка статьи" style="width: 100%; border-radius: 8px;" />
			<div style="font-weight: 600;">Руководство по токенам</div>
			<BaseText>Как задавать цвета, радиусы и тени через токены темы и не ломать контраст.</BaseText>
			<BaseText>Документация · 6 минут чтения</BaseText>
		</div>
	</BaseHoverCard>
`

export const Link: StoryObj<typeof meta> = {
	args: { isOpen: true, position: 'bottom-start' },
	parameters: {
		controls: { include: ['position', 'variant', 'openDelay', 'closeDelay', 'sizeScale'] },
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Предпросмотр ссылки: в карточке — обложка, заголовок, описание и время чтения. Сама ссылка остаётся рабочей и доступной без карточки:',
					'карточка только дополняет её (и не открывается на скринридере вместо перехода).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseHoverCard', 'BaseLink', 'BaseText'],
				models,
				script: `const preview = ${literal(preview)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseLink, BaseText },
		setup: useStorySetup(args, { models, slots: [], data: { preview } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const link = canvas.getByRole('link', { name: 'Руководство по токенам' })
		const title = await screen.findByText('Как задавать цвета, радиусы и тени через токены темы и не ломать контраст.')
		await expect(link).toHaveAttribute('aria-describedby', title.closest('[id^="rise-hover-card"]')!.id)
		await expect(screen.getByRole('img', { name: 'Обложка статьи' })).toBeVisible()

		await userEvent.hover(link)
		await userEvent.unhover(link)
		await waitFor(() => expect(screen.queryByText(/Как задавать цвета/)).not.toBeInTheDocument())
	},
}
