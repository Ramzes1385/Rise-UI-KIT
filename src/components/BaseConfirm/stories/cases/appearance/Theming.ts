import { BaseApp } from '@components/BaseApp'
import type meta from '../../BaseConfirm.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseConfirm from '../../../ui/BaseConfirm.vue'
import { expect, waitFor, within } from 'storybook/test'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['isOpen', 'title', 'onUpdate:isOpen']

const ui = { root: 'story-themed-confirm', description: 'story-themed-description' }

const state = { openFrame: null }

const template = `
	<div class="story-row">
		<div class="story-frame story-medium" style="height: 300px; overflow: hidden; transform: translateZ(0);">
			<BaseApp teleport-to="#confirm-theming-plain">
				<BaseButton variant="outline" @click="openFrame = 'plain'">По умолчанию</BaseButton>
				<BaseConfirm v-bind="args" title="По умолчанию" :is-open="openFrame === 'plain'" @update:is-open="openFrame = null" />
				<div id="confirm-theming-plain" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 300px; overflow: hidden; transform: translateZ(0); --rise-confirm-width: 320px; --rise-confirm-description-text: var(--rise-primary-text); --rise-confirm-description-font-size: var(--rise-font-size-base);">
			<BaseApp teleport-to="#confirm-theming-tokens">
				<BaseButton variant="outline" @click="openFrame = 'tokens'">Токены на контейнере</BaseButton>
				<BaseConfirm v-bind="args" title="Токены на контейнере" :is-open="openFrame === 'tokens'" @update:is-open="openFrame = null" />
				<div id="confirm-theming-tokens" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 300px; overflow: hidden; transform: translateZ(0);">
			<BaseApp teleport-to="#confirm-theming-ui">
				<BaseButton variant="outline" @click="openFrame = 'ui'">Классы через ui</BaseButton>
				<BaseConfirm v-bind="args" title="Классы через ui" :ui="ui" :is-open="openFrame === 'ui'" @update:is-open="openFrame = null" />
				<div id="confirm-theming-ui" />
			</BaseApp>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'isDanger', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-confirm-*` — только своих частей: `width` (наибольшая ширина окна),',
					'`description-text`, `description-font-size`. Затемнение, рамку, фон и отступы окна задают токены BaseModal (`--rise-modal-*`),',
					'кнопки — токены BaseButton. Задайте их на `:root`, в теме или на контейнере: окно телепортируется, и токены контейнера',
					'доходят до него, только если слой внутри контейнера — здесь `<BaseApp teleport-to>` (а `transform` рамки держит окно в её пределах).',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям: `root` (окно), `description`, `cancel`, `confirm`;',
					'глобально — `defaults.BaseConfirm.ui` плагина. Окно из области с `data-rise-theme` или `data-rise-motion` наследует её тему и движение.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp', 'BaseConfirm', 'BaseButton'],
				state,
				types: { openFrame: 'string | null' },
				script: `const ui = ${literal(ui)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseApp, BaseConfirm, BaseButton },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const open = async (name: string): Promise<HTMLElement> => {
			await userEvent.click(canvas.getByRole('button', { name }))
			return canvas.findByRole('alertdialog', { name })
		}
		const close = async (dialog: HTMLElement): Promise<void> => {
			await userEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
			await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument())
		}
		const description = (dialog: HTMLElement): CSSStyleDeclaration =>
			getComputedStyle(dialog.querySelector('.base-confirm__description') as HTMLElement)

		const plain = await open('По умолчанию')
		const { maxWidth } = getComputedStyle(plain)
		const { color } = description(plain)
		if (!isStoryBranded()) await expect(maxWidth).toBe('400px')
		await close(plain)

		const themed = await open('Токены на контейнере')
		await expect(getComputedStyle(themed).maxWidth).not.toBe(maxWidth)
		await expect(description(themed).color).not.toBe(color)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).maxWidth).toBe('320px')
		await close(themed)

		const classed = await open('Классы через ui')
		await expect(classed).toHaveClass('base-modal__content', 'base-confirm', 'story-themed-confirm')
		await expect(classed.querySelector('.base-confirm__description')).toHaveClass('story-themed-description')
		await close(classed)
	},
}
