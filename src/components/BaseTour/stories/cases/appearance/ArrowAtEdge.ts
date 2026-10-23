import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<div style="display: flex; justify-content: flex-end">
		<BaseButton id="tour-edge-target" variant="outline" @click="isOpen = true">Профиль</BaseButton>
	</div>
	<BaseTour v-bind="args" v-model:is-open="isOpen" />
`

function horizontalCenter(element: Element): number {
	const box = element.getBoundingClientRect()
	return box.left + box.width / 2
}

export const ArrowAtEdge: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		placement: 'bottom',
		showProgress: false,
		steps: [{ target: '#tour-edge-target', title: 'Ваш профиль', content: 'Аватар, имя и настройки уведомлений.' }],
	},
	parameters: {
		layout: 'padded',
		controls: { include: ['placement', 'gap', 'showArrow'] },
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Цель у правого края окна. Карточка сдвинулась внутрь окна, а стрелка осталась напротив середины кнопки.',
					'Сузьте окно или смените `placement` — стрелка переходит на край карточки, обращённый к цели. На мобильном',
					'карточка прижата к низу экрана, стрелка на её верхнем крае смотрит на цель.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTour', 'BaseButton'], models }),
		},
	},
	render: args => ({
		components: { BaseTour, BaseButton },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Ваш профиль' })
		await within(dialog).findByRole('button', { name: 'Завершить' })
		const card = dialog.querySelector('.base-tour__card') as HTMLElement
		const target = document.getElementById('tour-edge-target') as HTMLElement
		await waitFor(() => expect(card.querySelector('.base-tour__arrow')).not.toBeNull())
		const arrow = card.querySelector('.base-tour__arrow') as HTMLElement
		await waitFor(() => expect(Math.abs(horizontalCenter(arrow) - horizontalCenter(target))).toBeLessThan(1))
		await expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(document.documentElement.clientWidth)
	},
}
