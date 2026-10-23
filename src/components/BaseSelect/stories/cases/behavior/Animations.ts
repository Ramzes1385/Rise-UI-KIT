import { GENRES } from '../../shared'
import type meta from '../../BaseSelect.stories'
import { expect, waitFor } from 'storybook/test'
import BaseSelect from '../../../ui/BaseSelect.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseSelect v-bind="args" v-model="genres" />
	`,
	components: { BaseSelect, BaseButton },
	imports: ['BaseSelect'],
	state: { genres: ['drama', 'fantasy'] },
	action: "genres = genres.length > 2 ? ['drama', 'fantasy'] : ['drama', 'comedy', 'fantasy', 'detective']",
	trigger: 'Добавить или убрать жанры',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { label: 'Жанры', options: GENRES, isMultiple: true, placeholder: 'Выберите жанры' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Метки мультивыбора в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'Кнопка меняет `v-model`: добавляет «Комедию» и «Детектив» между выбранными и убирает их. Новая метка появляется',
					'с увеличением от `--rise-motion-scale-from` за `--rise-duration` (`--rise-ease-out`), снятая гаснет за',
					'`--rise-duration-fast` и на время ухода остаётся на своём месте, а соседи плавно сдвигаются (`transform`,',
					'`--rise-duration`) — без скачка строки. Галочка выбранного пункта в списке так же появляется с увеличением.',
					'Выпадающий список открывается анимацией `BaseDropdown`. Выключить движение —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда — метки появляются и исчезают сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Добавить или убрать жанры' })
		const tags = () => canvasElement.querySelectorAll('.base-select__tag')

		await expect(tags()).toHaveLength(8)
		await userEvent.click(button)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Удалить Детектив' })).toHaveLength(4))
		await waitFor(() => expect(tags()).toHaveLength(16))
		await userEvent.click(button)
		await waitFor(() => expect(tags()).toHaveLength(8))
		await expect(canvas.queryByRole('button', { name: 'Удалить Комедия' })).toBeNull()
	},
}
