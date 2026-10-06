import { DEMO_CUES } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import type meta from '../../BaseSubtitleEditor.stories'
import BaseSubtitleEditor from '../../../ui/BaseSubtitleEditor.vue'

const motion = motionPresetsStory({
	item: `
		<BaseSubtitleEditor v-bind="args" v-model:cues="cues" />
	`,
	components: { BaseSubtitleEditor, BaseButton },
	imports: ['BaseSubtitleEditor'],
	state: { cues: DEMO_CUES },
	action: 'cues = cues.slice(1)',
	trigger: 'Удалить первую реплику',
	omit: ['cues'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		maxWidth: 1600,
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Список реплик в четырёх пресетах движения; реплики общие для всех колонок. «Удалить первую реплику», «Добавить реплику»',
					'и правка начала, которая меняет порядок, двигают строки плавно: новая строка поднимается и проявляется (`transform` и',
					'`opacity`, `--rise-duration`, `--rise-ease-out`, сдвиг `--rise-motion-distance`), удалённая гаснет поверх списка',
					'(`position: absolute`, `--rise-duration-fast`, скрыта от скринридера), соседи съезжают плавно (FLIP через `transform`).',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная",
					'настройка «уменьшить движение» действует всегда.',
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const count = DEMO_CUES.length * 4
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(count))
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить первую реплику' }))
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(count - 4))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Добавить реплику' })[0])
		await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(count))
		for (const row of canvas.getAllByRole('listitem')) await waitFor(() => expect(row).toBeVisible())
	},
}
