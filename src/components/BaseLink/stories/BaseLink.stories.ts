/**
 * BaseLink — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, кастомный цвет) → состояния (отключённая,
 * длинный текст) → сценарии (внешняя ссылка, небезопасный адрес) → клавиатура.
 * Маршруты рендерит StoryRouterLink — как RouterLink, но без перехода со страницы Storybook.
 */

import { expect, fn, within } from 'storybook/test'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	slotArgType,
	StoryRouterLink,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import { BaseText } from '@components/BaseText'
import { LINK_VARIANTS } from '../model/BaseLink.types'
import BaseLink from '../ui/BaseLink.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Navigation/BaseLink',
	component: BaseLink,
	parameters: {
		docs: {
			description: {
				component: [
					'Ссылка: маршрут приложения (`to`) или внешний адрес (`href`).',
					'',
					'- `to` рендерит компонент ссылок приложения: проп `linkComponent`, `createUiKitPlugin({ linkComponent })`',
					'  или RouterLink, если подключён vue-router. Без роутера — `<a href>`. Внешний адрес в `to` (`https://…`)',
					'  всегда обычная ссылка.',
					'- `href` — всегда `<a href>`. `target="_blank"` добавляет `rel="noopener noreferrer"`, стрелку и подсказку',
					'  «откроется в новой вкладке» для скринридера.',
					'- Небезопасные схемы (`javascript:`, `data:`) не попадают в адрес: ссылка показывается отключённой,',
					'  в консоли — предупреждение.',
					'- Шрифт и размер берутся у окружающего текста, `sizeScale` масштабирует их. `default` — цвет ссылки',
					'  и тонкое подчёркивание: в тексте ссылку видно не только по цвету. `ghost` — цвет текста вокруг,',
					'  подчёркивание при наведении: для навигации и списков ссылок, не для сплошного текста.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: LINK_VARIANTS }),
		...hiddenArgTypes('linkComponent'),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		to: { control: 'text', table: propGroup(ARG_GROUP.content) },
		href: { control: 'text', table: propGroup(ARG_GROUP.content) },
		target: { control: 'inline-radio', options: ['_self', '_blank'], table: propGroup(ARG_GROUP.behavior) },
		rel: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: slotArgType('Содержимое (заменяет label)'),
	},
	args: {
		label: 'Настройки проекта',
		to: '/projects/42/settings',
		variant: 'default',
		sizeScale: 100,
		isDisabled: false,
		linkComponent: StoryRouterLink,
		onClick: fn(),
	},
} satisfies Meta<typeof BaseLink>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: ссылка на маршрут. Tab ставит на неё фокус (видно кольцо), Enter переходит по ссылке. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link).toHaveAttribute('href', '/projects/42/settings')

		await tabTo(link, userEvent)
		await expect(getComputedStyle(link).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Варианты: `default` — цвет ссылки и подчёркивание, для ссылок в тексте; `ghost` — цвет окружающего текста,
 * подчёркивание при наведении, для навигации и списков ссылок (подвал, меню, таблицы).
 */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseLink, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-stack">
				<BaseText>Вариант default: откройте <BaseLink v-bind="props" variant="default" label="настройки проекта" />, чтобы пригласить участников.</BaseText>
				<nav aria-label="Подвал" class="story-row">
					<BaseLink v-bind="props" variant="ghost" to="/about" label="О студии" />
					<BaseLink v-bind="props" variant="ghost" to="/help" label="Помощь" />
					<BaseLink v-bind="props" variant="ghost" to="/terms" label="Условия" />
				</nav>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale` — относительно окружающего текста: 75 / 87.5 / 100 / 112.5 / 125. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div class="story-row"><BaseLink v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :label="sizeLabel(preset)" /></div>',
	}),
}

/** Кастомный цвет через `color`: текст и цвет при наведении. Токены `var(--rise-…)` сохраняют контраст в обеих темах. */
export const CustomColor: Story = {
	args: { color: { text: { base: 'var(--rise-success-text)', hover: 'var(--rise-success)' } } },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённая ссылка: без адреса, вне порядка Tab, `aria-disabled`; клик ничего не делает. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Настройки проекта' })
		await expect(link).toHaveAttribute('aria-disabled', 'true')
		await expect(link).not.toHaveAttribute('href')
		await userEvent.click(link)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}

/** Длинный текст переносится по словам вместе с окружающим текстом. */
export const LongContent: Story = {
	render: args => ({
		components: { BaseLink, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseText style="max-width: 280px;">
				Перед публикацией проверьте
				<BaseLink v-bind="props" label="требования к субтитрам, звуковым дорожкам и обложкам серий для каталога сообщества" />
				— иначе модерация вернёт серию на доработку.
			</BaseText>
		`,
	}),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link')
		await expect(link.getClientRects().length).toBeGreaterThan(1)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Внешняя ссылка в новой вкладке: `rel="noopener noreferrer"`, стрелка и подсказка для скринридера. */
export const External: Story = {
	args: { to: undefined, href: 'https://example.com/guide', target: '_blank', label: 'Руководство по озвучке' },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Руководство по озвучке/ })
		await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		await expect(link).toHaveAccessibleName('Руководство по озвучке (откроется в новой вкладке)')
		await expect(within(link).getByText('↗')).toHaveAttribute('aria-hidden', 'true')
	},
}

/** Небезопасный адрес из данных (`javascript:`) не попадает в `href`: ссылка отключена, в консоли — предупреждение. */
export const UnsafeUrl: Story = {
	args: { to: undefined, href: 'javascript:alert(1)', label: 'Ссылка из комментария' },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Ссылка из комментария' })
		await expect(link).not.toHaveAttribute('href')
		await expect(link).toHaveAttribute('aria-disabled', 'true')
	},
}
