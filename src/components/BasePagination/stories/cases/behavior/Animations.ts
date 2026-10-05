import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BasePagination from '../../../ui/BasePagination.vue'

const motion = motionPresetsStory({
	item: `
		<BasePagination v-bind="args" v-model="page" :total="50" />
	`,
	components: { BasePagination, BaseButton },
	imports: ['BasePagination'],
	state: { page: 1 },
	action: 'page = page >= 5 ? 1 : page + 2',
	trigger: 'Другая страница',
	slots: ['default'],
	omit: ['modelValue', 'total', 'default'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена страницы в колонках четырёх пресетов движения: «Другая страница» переводит на 3-ю, 5-ю и обратно на 1-ю.',
					'Подложка текущей страницы — один элемент на список: она переезжает к новому номеру (`transform`, размер) на кривой',
					'`--rise-ease-spring` за `--rise-duration`, цвет текста номеров меняется за `--rise-duration-fast`. Первый показ — без',
					'переезда. Набор номеров (окно вокруг текущей страницы, многоточия) меняется сразу.',
					'В пресете `none` и при «уменьшить движение» подложка сразу на месте. Выключить в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
					'В превью четыре одинаковые пагинации с одним именем ориентира, поэтому правило axe `landmark-unique` у этой истории',
					'выключено: в приложении у нескольких пагинаций на странице — свои `ariaLabel`.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Другая страница' }))
		await waitFor(() =>
			expect(canvas.getAllByRole('button', { current: 'page' }).map(page => page.textContent?.trim())).toEqual(['3', '3', '3', '3']),
		)
		const none = canvasElement.querySelector('[data-rise-motion="none"] .base-pagination__indicator')
		await waitFor(() => expect(none).toHaveClass('base-pagination__indicator--instant'))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-pagination__indicator')).toHaveLength(4))
	},
}
