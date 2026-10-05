import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseInputTags.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseInputTags from '../../../ui/BaseInputTags.vue'

const motion = motionPresetsStory({
	item: `
		<BaseInputTags v-bind="args" v-model="tags" />
	`,
	components: { BaseInputTags, BaseButton },
	imports: ['BaseInputTags'],
	state: { tags: ['Vue', 'Vite'] },
	action: "tags = tags.length > 2 ? ['Vue', 'Vite'] : ['Vue', 'Pinia', 'Vite']",
	trigger: 'Добавить или удалить тег',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Теги в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`. Кнопка меняет',
					'`v-model`: вставляет «Pinia» между тегами и убирает его. Новый тег появляется с увеличением от',
					'`--rise-motion-scale-from` за `--rise-duration` (`--rise-ease-out`), удалённый гаснет за `--rise-duration-fast`',
					'и на время ухода остаётся на своём месте, а соседи плавно сдвигаются (`transform`, `--rise-duration`) — без',
					'скачка. Так же ведут себя Enter, разделитель, вставка и крестик. Выключить движение —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда — теги появляются и исчезают сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Добавить или удалить тег' })
		const tags = () => canvasElement.querySelectorAll('.base-input-tags__tag')

		await expect(tags()).toHaveLength(8)
		await userEvent.click(button)
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Удалить Pinia' })).toHaveLength(4))
		await waitFor(() => expect(tags()).toHaveLength(12))
		await userEvent.click(button)
		await waitFor(() => expect(tags()).toHaveLength(8))
		await expect(canvas.queryByRole('button', { name: 'Удалить Pinia' })).toBeNull()
	},
}
