import { expect } from 'storybook/test'
import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import BaseModal from '../../../ui/BaseModal.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { content: 'story-themed-modal', title: 'story-themed-title' }

const template = `
	<div class="story-row">
		<div class="story-frame story-medium" style="height: 220px;">
			<BaseModal v-bind="args" is-open is-contained title="По умолчанию">
				<BaseText>Окно без настроек.</BaseText>
			</BaseModal>
		</div>
		<div class="story-frame story-medium" style="height: 220px; --rise-modal-content-bg: var(--rise-primary-soft); --rise-modal-content-text: var(--rise-primary-text); --rise-modal-content-radius: var(--rise-radius-2xl); --rise-modal-content-padding-x: 28px; --rise-modal-title-font-size: var(--rise-font-size-lg);">
			<BaseModal v-bind="args" is-open is-contained title="Токены на контейнере">
				<BaseText>Фон, текст, радиус и отступы окна.</BaseText>
			</BaseModal>
		</div>
		<div class="story-frame story-medium" style="height: 220px;">
			<BaseModal v-bind="args" is-open is-contained title="Классы через ui" :ui="ui">
				<BaseText>Классы добавлены к окну и заголовку.</BaseText>
			</BaseModal>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-modal-*` кит только читает: `bg` (затемнение), `padding` (отступ окна от краёв),',
					'`content-bg`, `content-text`, `content-border`, `content-radius`, `content-shadow`, `content-width` (наибольшая ширина),',
					'`content-padding-x`, `content-padding-y` (шапка, тело, подвал), `title-font-size` — задайте их на `:root`, в теме или на контейнере.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `content`, `header`, `header-left`, `title`, `close`, `body`, `footer`);',
					'глобально — `defaults.BaseModal.ui` плагина. Окно из области с `data-rise-theme` или `data-rise-motion` наследует её тему и движение.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseModal', 'BaseText'],
				script: `const ui = ${literal(ui)}`,
				omit: ['default', 'isOpen', 'title', 'isContained', 'onUpdate:isOpen'],
			}),
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: useStorySetup(args, { data: { ui }, slots: ['default', 'footer'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = await canvas.findAllByRole('dialog')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded())
			await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('12px')
		await expect(classed).toHaveClass('base-modal__content', 'story-themed-modal')
		await expect(classed.querySelector('.base-modal__title')).toHaveClass('story-themed-title')
	},
}
