import type meta from '../../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAffix from '../../../ui/BaseAffix.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-affix' }

const template = `
	<div class="story-grid" style="--story-grid-min: 220px">
		<div id="story-affix-theme-plain" tabindex="0" role="region" aria-label="По умолчанию" style="height: 200px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
			<div style="padding: 24px 16px">По умолчанию</div>
			<BaseAffix v-bind="args" has-shadow target="#story-affix-theme-plain">
				<div style="padding: 12px 16px; background: var(--rise-bg-elevated)">Панель</div>
			</BaseAffix>
			<div v-for="n in 8" :key="n" style="padding: 12px 16px 0">Строка {{ n }}</div>
		</div>
		<div style="--rise-affix-shadow: 0 6px 0 var(--rise-primary)">
			<div id="story-affix-theme-token" tabindex="0" role="region" aria-label="Токен на обёртке" style="height: 200px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
				<div style="padding: 24px 16px">Токен на обёртке</div>
				<BaseAffix v-bind="args" has-shadow target="#story-affix-theme-token">
					<div style="padding: 12px 16px; background: var(--rise-bg-elevated)">Панель</div>
				</BaseAffix>
				<div v-for="n in 8" :key="n" style="padding: 12px 16px 0">Строка {{ n }}</div>
			</div>
		</div>
		<div id="story-affix-theme-ui" tabindex="0" role="region" aria-label="Классы через ui" style="height: 200px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
			<div style="padding: 24px 16px">Классы через ui</div>
			<BaseAffix v-bind="args" has-shadow :ui="ui" target="#story-affix-theme-ui">
				<div style="padding: 12px 16px; background: var(--rise-bg-elevated)">Панель</div>
			</BaseAffix>
			<div v-for="n in 8" :key="n" style="padding: 12px 16px 0">Строка {{ n }}</div>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Тень без пропов. Токен `--rise-affix-shadow` кит только читает: он задаёт тень прилипшего блока при `hasShadow` (по умолчанию `--rise-shadow-md`).',
					'Задайте его на `:root`, в теме или на обёртке; здесь средняя область получает сплошную тень цвета `--rise-primary`.',
					'Проп `ui` добавляет классы к корню (`root`); глобально — `defaults.BaseAffix.ui` плагина. Список токенов — docs/design/COMPONENT_TOKENS.md.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAffix'],
				script: `const ui = ${literal(ui)}`,
				omit: ['hasShadow'],
			}),
		},
	},
	render: args => ({
		components: { BaseAffix },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const containers = ['plain', 'token', 'ui'].map(name => canvasElement.querySelector(`#story-affix-theme-${name}`) as HTMLElement)
		const [plain, themed, classed] = containers.map(container => container.querySelector('.base-affix') as HTMLElement)
		for (const container of containers) container.scrollTop = 120

		for (const affix of [plain, themed, classed]) await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(getComputedStyle(themed).boxShadow).toContain('0px 6px 0px 0px'))
		await expect(getComputedStyle(plain).boxShadow).not.toBe(getComputedStyle(themed).boxShadow)
		if (!isStoryBranded()) await expect(getComputedStyle(plain).boxShadow).not.toContain('0px 6px 0px 0px')
		await expect(classed).toHaveClass('base-affix', 'story-themed-affix')
	},
}
