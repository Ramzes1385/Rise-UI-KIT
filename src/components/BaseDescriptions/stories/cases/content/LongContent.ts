import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		title: 'Очень длинный заголовок списка, который не помещается в одну строку на узком экране телефона',
		isCopyable: true,
		items: [
			{
				key: 'name',
				label: 'Полное наименование организации по уставу',
				value: 'Общество с ограниченной ответственностью «Научно-производственное объединение „Ромашка и партнёры“»',
			},
			{ key: 'link', label: 'Сайт', value: 'https://example.com/very/long/path/without/spaces/that/must/wrap/inside/the/column' },
			{ key: 'note', label: 'Комментарий', value: 'Первая строка.\nВторая строка — переносы в значении сохраняются.', span: 'full' },
		],
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Длинные подписи и значения переносятся по словам, строка без пробелов — в любом месте; ширина не больше',
					'контейнера. Переводы строк в значении сохраняются.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-descriptions') as HTMLElement
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
	},
}
