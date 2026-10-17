import { IMAGE_MAP_MALL } from '../../fixtures'
import { expect, within } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { inlineEnd, inlineStart } from '@/stories/helpers'

export const DirectoryGrid: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: "Список справа (`directoryPosition: 'end'`) карточками с миниатюрой `image` (`directoryView: 'grid'`), разделы по первой букве (`directoryGroupBy: 'alpha'`, «ё» — в разделе «Е»). Внутри раздела — по алфавиту языка кита, числа по значению: «Магазин 102» раньше «Магазин 105».",
			},
		},
	},
	args: {
		data: IMAGE_MAP_MALL,
		hasDirectory: true,
		hasFilters: false,
		directoryPosition: 'end',
		directoryView: 'grid',
		directoryGroupBy: 'alpha',
	},
	play: async ({ canvas, canvasElement }) => {
		const directory = canvas.getByRole('complementary', { name: 'Список объектов' })
		const sections = within(directory).getAllByRole('list')
		await expect(sections.map(section => section.getAttribute('aria-label'))).toEqual(['Л', 'М', 'С'])
		await expect(directory.querySelectorAll('.base-image-map__thumb')).toHaveLength(12)
		const map = (canvasElement.querySelector('.base-image-map__viewport') as HTMLElement).getBoundingClientRect()
		const list = directory.getBoundingClientRect()
		await expect(inlineStart(list) >= inlineEnd(map) - 1 || list.top >= map.bottom - 1).toBe(true)
	},
}
