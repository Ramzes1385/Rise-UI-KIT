import type meta from '../../BaseLink.stories'
import BaseLink from '../../../ui/BaseLink.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseLink v-bind="args" :variant="variant" />
	`,
	components: { BaseLink, BaseButton },
	imports: ['BaseLink'],
	state: { variant: 'default' },
	action: "variant = variant === 'default' ? 'ghost' : 'default'",
	trigger: 'Сменить вариант',
	slots: ['variant'],
	omit: ['variant', 'linkComponent'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Цвет ссылки и цвет подчёркивания в четырёх пресетах движения: наведите на ссылку или нажмите «Сменить вариант»',
					'(`default` ↔ `ghost`). Цвет, цвет подчёркивания и прозрачность меняются переходом за `--rise-duration-fast`',
					'на кривой `--rise-ease`; подчёркивание `ghost` проявляется из прозрачного, а не появляется рывком.',
					"В `none` и при «уменьшить движение» — сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const links = canvas.getAllByRole('link', { name: 'Настройки проекта' })
		await expect(links).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить вариант' }))
		for (const link of links) await expect(link).toHaveClass('base-link--ghost')
		for (const link of links) await waitFor(() => expect(getComputedStyle(link).textDecorationColor).toBe('rgba(0, 0, 0, 0)'))
	},
}
