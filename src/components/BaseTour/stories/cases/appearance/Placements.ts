import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton id="tour-target" variant="outline" @click="isOpen = true">Цель тура</BaseButton>
	<BaseTour v-bind="args" v-model:is-open="isOpen" />
`

const NARROW_VIEWPORT = 640

export const Placements: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		placement: 'right',
		showProgress: false,
		steps: [{ target: '#tour-target', title: 'Сторона карточки', content: 'Меняйте placement в Controls.' }],
	},
	parameters: {
		controls: { include: ['placement', 'gap', 'padding', 'radius'] },
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Сторона карточки `placement`: `top`, `bottom`, `left`, `right` или `auto` (где больше места). Шаг может задать',
					'свою сторону полем `placement`. Меняйте значение в Controls. Если на выбранной стороне нет места (телефон), карточка уходит на другую.',
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
		const dialog = await screen.findByRole('dialog', { name: 'Сторона карточки' })
		await within(dialog).findByRole('button', { name: 'Завершить' })
		const card = dialog.querySelector('.base-tour__card') as HTMLElement
		const target = document.getElementById('tour-target') as HTMLElement
		const isNarrow = window.innerWidth < NARROW_VIEWPORT
		await waitFor(() =>
			isNarrow
				? expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth)
				: expect(card.getBoundingClientRect().left).toBeGreaterThan(target.getBoundingClientRect().right),
		)
	},
}
