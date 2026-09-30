import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%">
		<BasePopconfirm v-bind="args" :is-open="true" position="top" title="Удалить черновик?">
			<BaseButton variant="outline">Удалить</BaseButton>
		</BasePopconfirm>
		<BasePopconfirm v-bind="args" :is-open="true" position="top" title="Отправить в архив?">
			<BaseButton variant="outline">В архив</BaseButton>
		</BasePopconfirm>
	</div>
`

function horizontalCenter(element: Element): number {
	const box = element.getBoundingClientRect()
	return box.left + box.width / 2
}

async function expectArrowAtTrigger(title: string, triggerName: string): Promise<void> {
	const dialog = await screen.findByRole('alertdialog', { name: title })
	const panel = dialog.closest('.base-dropdown__panel') as HTMLElement
	const arrow = panel.querySelector('.base-dropdown__arrow') as HTMLElement
	const trigger = screen.getByRole('button', { name: triggerName })
	await waitFor(() => expect(panel).toHaveClass('base-dropdown__panel--arrow-top'))
	await waitFor(() => expect(Math.abs(horizontalCenter(arrow) - horizontalCenter(trigger))).toBeLessThan(1))
	await expect(Math.abs(horizontalCenter(panel) - horizontalCenter(trigger))).toBeGreaterThan(10)
}

export const ArrowAtEdge: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant', 'sizeScale', 'isDanger', 'showArrow'] },
		docs: {
			...docsFrame(260),
			description: {
				story: [
					'Кнопки у краёв окна. Сверху места нет — панель перевернулась вниз, стрелка перешла на её верхний край.',
					'У края окна панель сдвинулась внутрь, а стрелка осталась напротив середины кнопки. Сузьте окно — стрелка',
					'следует за кнопкой.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BasePopconfirm', 'BaseButton'], omit: ['isOpen', 'position', 'title'] }),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async () => {
		await expectArrowAtTrigger('Удалить черновик?', 'Удалить')
		await expectArrowAtTrigger('Отправить в архив?', 'В архив')
	},
}
