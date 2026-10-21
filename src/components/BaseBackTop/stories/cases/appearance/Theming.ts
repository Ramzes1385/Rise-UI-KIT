import { NEWS, scrollList } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBackTop.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBackTop from '../../../ui/BaseBackTop.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const news = NEWS

const ui = { root: 'story-themed-back-top', icon: 'story-themed-icon' }

const template = `
	<div style="position: relative; max-width: 480px">
		<div :id="listId" tabindex="0" role="region" aria-label="Лента новостей" style="height: 280px; overflow: auto; border: 1px solid var(--rise-border); border-radius: 8px">
			<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 12px">
				<li v-for="item in news" :key="item">{{ item }}</li>
			</ul>
		</div>
		<BaseBackTop v-bind="args" :target="'#' + listId" label="По умолчанию" position="bottom-left" />
		<div style="--rise-fab-bg: var(--rise-success); --rise-fab-bg-hover: var(--rise-success-hover); --rise-fab-radius: var(--rise-radius-lg); --rise-fab-shadow: var(--rise-shadow-sm);">
			<BaseBackTop v-bind="args" :target="'#' + listId" label="Токены на контейнере" position="bottom-right" />
		</div>
		<BaseBackTop v-bind="args" :target="'#' + listId" label="Классы через ui" position="top-right" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['isExtended', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Прокрутите ленту — появятся три кнопки. Своего вида у «Наверх» нет: это BaseFab, поэтому перекраска — токены',
					'`--rise-fab-*` (`bg`, `bg-hover`, `text`, `border`, `radius`, `shadow`, `height`, `padding-x`, `gap`, `font-weight`).',
					'Кит их только читает: задайте их на `:root`, в теме или на контейнере — как здесь; так они действуют и на BaseFab,',
					'и на BaseBackTop. Проп `ui` добавляет классы к частям (`root`, `icon`, `label`); глобально — `defaults.BaseBackTop.ui`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBackTop'],
				script: [
					'const news = Array.from({ length: 40 }, (_, index) => `Новость ${index + 1}: склад в Волгограде принял ${20 + index} поставок`)',
					`const listId = 'news'`,
					`const ui = ${literal(ui)}`,
				].join('\n'),
				omit: ['label', 'position'],
			}),
		},
	},
	render: (args, { id }) => ({
		components: { BaseBackTop },
		setup: useStorySetup(args, { data: { news, ui, listId: `news-${id}` }, slots: ['label', 'position'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await scrollList(canvasElement)
		const plain = await canvas.findByRole('button', { name: 'По умолчанию' })
		const themed = await canvas.findByRole('button', { name: 'Токены на контейнере' })
		const classed = await canvas.findByRole('button', { name: 'Классы через ui' })

		await waitFor(() => expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor))
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('12px')
		await expect(classed).toHaveClass('base-back-top', 'base-fab', 'story-themed-back-top')
		await expect(classed.querySelector('.base-back-top__icon')).toHaveClass('base-fab__icon', 'story-themed-icon')
	},
}
