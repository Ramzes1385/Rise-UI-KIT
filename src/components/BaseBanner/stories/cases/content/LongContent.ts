import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseBanner v-bind="args">
			<template #action>
				<BaseLink href="#details" variant="ghost">Подробнее о переносе</BaseLink>
			</template>
		</BaseBanner>
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	args: {
		type: 'warning',
		variant: 'soft',
		isClosable: true,
		text: 'Плановые работы в ночь на воскресенье: с 02:00 до 06:00 по московскому времени личный кабинет, выгрузка отчётов и интеграция с календарём команды «Ребрендинг» будут недоступны, незавершённые операции придётся запустить заново.',
	},
	parameters: {
		docs: {
			description: {
				story: 'Очень длинный текст с действием в узком контейнере переносится по словам; иконка и кнопка закрытия остаются на месте.',
			},
			source: storySource({ template, imports: ['BaseBanner', 'BaseLink'] }),
		},
	},
	render: args => ({
		components: { BaseBanner, BaseLink },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const banner = canvas.getByRole('region', { name: 'Объявление' })
		const close = canvas.getByRole('button', { name: 'Закрыть' })
		await expect(banner.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(banner.getBoundingClientRect().right)
		await expect(banner.scrollWidth).toBeLessThanOrEqual(banner.clientWidth)
	},
}
