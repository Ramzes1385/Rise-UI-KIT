import { TECH_TAGS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'

const [first, ...rest] = TECH_TAGS

const motion = motionPresetsStory({
	item: `
		<BaseTagGroup v-bind="args" :items="tags" @remove="item => (tags = tags.filter(tag => tag.value !== item.value))" />
	`,
	components: { BaseTagGroup, BaseButton },
	imports: ['BaseTagGroup'],
	state: { tags: rest, first },
	action: 'tags = tags.some(tag => tag.value === first.value) ? tags.filter(tag => tag.value !== first.value) : [first, ...tags]',
	trigger: 'Добавить или убрать Vue',
	slots: ['tag'],
	omit: ['items'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { selectionMode: 'none', modelValue: null, isRemovable: true },
	parameters: {
		controls: { include: ['variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Добавление и удаление меток в колонках четырёх пресетов движения. Новая метка появляется с масштабом и прозрачностью',
					'(пружина `--rise-ease-spring` за `--rise-duration`), удалённая гаснет на своём месте за `--rise-duration-fast`,',
					'соседи сдвигаются через `transform` за `--rise-duration` — без скачка раскладки. «×» у каждой метки тоже удаляет её.',
					'В пресете `none` и при «уменьшить движение» — сразу конечное состояние. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Добавить или убрать Vue' })
		await userEvent.click(toggle)
		await waitFor(() => expect(canvas.getAllByText('Vue')).toHaveLength(4))
		for (const tag of canvas.getAllByText('Vue')) await waitFor(() => expect(tag).toBeVisible())
		await userEvent.click(toggle)
		await waitFor(() => expect(canvas.queryAllByText('Vue')).toHaveLength(0))
		await expect(canvas.getAllByText('React')).toHaveLength(4)
	},
}
