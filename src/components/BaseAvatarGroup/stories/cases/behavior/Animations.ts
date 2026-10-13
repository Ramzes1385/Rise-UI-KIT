import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseAvatarGroup from '../../../ui/BaseAvatarGroup.vue'

const team = ['Анна Смирнова', 'Иван Петров', 'Мария Кузнецова', 'Олег Соколов', 'Екатерина Волкова', 'Дмитрий Орлов'].map(name => ({
	name,
}))

const motion = motionPresetsStory({
	item: `
		<BaseAvatarGroup v-bind="args" :items="team.slice(0, visible)" />
	`,
	components: { BaseAvatarGroup, BaseButton },
	imports: ['BaseAvatarGroup'],
	state: { team, visible: 3 },
	action: 'visible = visible === team.length ? 3 : visible + 1',
	trigger: 'Ещё участник',
	slots: [],
	omit: ['items'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'shape', 'max', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена состава в четырёх пресетах движения: «Ещё участник» добавляет человека, после шестого — снова трое.',
					'Пришедший появляется с «pop» (`--rise-motion-scale-from`, `--rise-ease-spring`, `--rise-duration`), ушедший гаснет',
					'за `--rise-duration-fast` на своём месте, соседи сдвигаются (`transform`). Число «+N» меняется тем же «pop».',
					"В `none` и при «уменьшить движение» — сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Ещё участник' }))
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(16))
		await userEvent.click(canvas.getByRole('button', { name: 'Ещё участник' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Ещё участник' }))
		await waitFor(() => expect(canvas.getAllByText('и ещё 2')).toHaveLength(4))
	},
}
