import { docsFrame } from '../shared'
import type meta from '../BaseTour.stories'
import BaseTour from '../../ui/BaseTour.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

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
					'свою сторону полем `placement`. Меняйте значение в Controls.',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onOpen = useModelArg('isOpen')
		return {
			components: { BaseTour, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen }),
			template: `
				<BaseButton id="tour-target" variant="outline" @click="onOpen(true)">Цель тура</BaseButton>
				<BaseTour v-bind="props" @update:is-open="onOpen" />
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Сторона карточки' })
		await within(dialog).findByRole('button', { name: 'Завершить' })
		const card = dialog.querySelector('.base-tour__card') as HTMLElement
		const target = document.getElementById('tour-target') as HTMLElement
		await waitFor(() => expect(card.getBoundingClientRect().left).toBeGreaterThan(target.getBoundingClientRect().right))
	},
}
