import type meta from '../../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div :key="replay" id="story-affix-motion-%preset%" tabindex="0" role="region" aria-label="Область %preset%" style="height: 160px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
			<div style="padding: 16px">Прокрутите вниз</div>
			<BaseAffix v-bind="args" has-shadow target="#story-affix-motion-%preset%">
				<div style="padding: 8px 16px; background: var(--rise-bg-elevated)">Панель</div>
			</BaseAffix>
			<div v-for="n in 8" :key="n" style="padding: 8px 16px 0">Строка {{ n }}</div>
		</div>
	`,
	components: { BaseAffix, BaseButton },
	imports: ['BaseAffix'],
	slots: [],
	omit: ['hasShadow'],
})

const PRESETS = ['none', 'subtle', 'standard', 'expressive']

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['offsetTop', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своего движения у блока нет: при прилипании меняется только тень (`hasShadow`) — она плавно проявляется переходом `box-shadow`.',
					'Прокрутите любую область: длительность перехода берётся из пресета движения колонки (`--rise-duration`), кнопка «Повторить» возвращает области наверх.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда, и тень появляется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const regions = () => PRESETS.map(preset => canvasElement.querySelector(`#story-affix-motion-${preset}`) as HTMLElement)
		for (const region of regions()) region.scrollTop = 120
		for (const region of regions()) {
			const affix = region.querySelector('.base-affix') as HTMLElement
			await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
			await waitFor(() => expect(getComputedStyle(affix).boxShadow).not.toBe('none'))
		}

		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		for (const region of regions()) {
			await expect(region.scrollTop).toBe(0)
			await waitFor(() => expect(region.querySelector('.base-affix')).not.toHaveClass('base-affix--fixed'))
		}
	},
}
