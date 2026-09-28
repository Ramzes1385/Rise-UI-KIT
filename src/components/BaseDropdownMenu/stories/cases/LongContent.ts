import { docsFrame } from '../shared'
import type meta from '../BaseDropdownMenu.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'
import BaseDropdownMenu from '../../ui/BaseDropdownMenu.vue'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		items: [
			[
				{ label: 'Перенести серию в сезон «Северный ветер. Продолжение истории» и обновить нумерацию' },
				{ label: 'Сделать копию для сообщества переводчиков с сохранением таймингов субтитров' },
			],
			Array.from({ length: 12 }, (_, index) => ({ label: `Серия ${index + 1}` })),
		],
	},
	parameters: {
		docs: {
			...docsFrame(400),
			description: {
				story: 'Длинные подписи переносятся по словам; панель не шире 320px. Длинный список прокручивается внутри панели.',
			},
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseDropdownMenu v-bind="props">
				<BaseButton variant="outline">Переместить</BaseButton>
			</BaseDropdownMenu>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переместить' }))
		const menu = await screen.findByRole('menu')
		const panel = menu.closest('.base-dropdown__panel') as HTMLElement
		await waitFor(() => expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight))
	},
}
