import { SLOT_KEYS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../../../types/BaseMegaMenu.types'

const items: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				title: 'Платформа',
				items: [
					{ label: 'Аналитика', to: '/analytics' },
					{ label: 'Документы', to: '/docs' },
				],
			},
		],
	},
	{
		key: 'resources',
		label: 'Ресурсы',
		groups: [
			{
				title: 'Изучить',
				items: [
					{ label: 'Справка', to: '/help' },
					{ label: 'Блог', to: '/blog' },
					{ label: 'Вебинары', to: '/webinars' },
				],
			},
		],
	},
]

const omit = [...SLOT_KEYS, 'items', 'openKey', 'onUpdate:openKey']

const motion = motionPresetsStory({
	item: `
		<div style="min-height: 260px;">
			<BaseMegaMenu v-bind="args" v-model:open-key="openKey" :items="items" />
		</div>
	`,
	components: { BaseMegaMenu, BaseButton },
	imports: ['BaseMegaMenu'],
	state: { openKey: 'products', items },
	action: "openKey = openKey === 'products' ? 'resources' : 'products'",
	trigger: 'Сменить раздел',
	slots: omit,
	omit,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { trigger: 'click' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Меню в четырёх пресетах движения. «Сменить раздел» переключает открытую панель: новое содержимое проявляется за',
					'`--rise-duration` (`--rise-ease-out`) и сразу задаёт высоту панели, прежнее гаснет поверх него за `--rise-duration-fast`',
					'(`--rise-ease-in`) — без анимации высоты. Панель открывается и закрывается проявлением со сдвигом. Вложенный уровень',
					'ссылок въезжает «вглубь» на `--rise-motion-distance`: сбоку — слева направо, под строкой пункта и в мобильном виде —',
					'сверху. В мобильном виде список разделов и панель под разделом съезжают сверху и проявляются. В `none` и при',
					"«уменьшить движение» всё меняется сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить раздел' }))
		await waitFor(() => {
			const panels = [...canvasElement.querySelectorAll('.base-mega-menu__panel')]
			expect(panels).toHaveLength(4)
			for (const panel of panels) {
				expect(panel.querySelectorAll('.base-mega-menu__content')).toHaveLength(1)
				expect(panel).toHaveTextContent('Блог')
				expect(panel.querySelector('.base-mega-menu__content')!.className).not.toMatch(/enter/)
			}
		})
	},
}
