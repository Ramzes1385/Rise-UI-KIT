/**
 * BaseAvatar — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры, формы, кастомный цвет) →
 * содержимое (изображение, запасные инициалы, слот) → сценарии (статус «в сети», группа аватаров).
 */

import { expect, fn, waitFor } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import {
	ARG_GROUP,
	baseArgTypes,
	BROKEN_IMAGE_SRC,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_USERS,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseAvatar from '../ui/BaseAvatar.vue'
import { AVATAR_SHAPES, AVATAR_VARIANTS } from '../model/BaseAvatar.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const [anna, ivan, maria, oleg] = STORY_USERS

/** Props витрин: содержимое аватара задаёт сам пример, из Controls берутся только внешний вид и статус. */
const CONTENT_ARGS = ['default', 'src', 'alt', 'name']

const meta = {
	title: 'Element/BaseAvatar',
	component: BaseAvatar,
	parameters: {
		docs: {
			description: {
				component: [
					'Аватар пользователя или объекта: изображение, а если его нет — инициалы из `name` (до двух букв).',
					'',
					'- `default` — нейтральный фон; `soft` — мягкий фон основного цвета; `outline`, `shadow`, `ghost` — для аватаров на цветном фоне и в плотных списках.',
					'- Размер задаёт `sizeScale`: 100 — 32px, как высота кнопки и поля.',
					'- Если изображение не загрузилось, показываются инициалы; при смене `src` аватар снова пробует его загрузить.',
					'- `isOnline` добавляет точку статуса с доступным именем «в сети».',
					'',
					'Аватар не фокусируется: для действия по клику оберните его в кнопку или ссылку с `aria-label`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: AVATAR_VARIANTS }),
		name: { control: 'text', table: propGroup(ARG_GROUP.content) },
		src: { control: 'text', table: propGroup(ARG_GROUP.content) },
		alt: { control: 'text', table: propGroup(ARG_GROUP.content) },
		shape: { control: 'inline-radio', options: AVATAR_SHAPES, table: propGroup(ARG_GROUP.appearance) },
		isOnline: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: { control: false },
	},
	args: {
		name: anna.name,
		variant: 'default',
		shape: 'circle',
		isOnline: false,
		sizeScale: 100,
		onClick: fn(),
	},
} satisfies Meta<typeof BaseAvatar>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Без `src` видны инициалы из `name`; клик вызывает событие `click`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const initials = canvas.getByText('АС')
		await userEvent.click(initials)
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов — с инициалами и с изображением. `default` — основной; `soft` выделяет аватар цветом;
 * `outline` и `shadow` отделяют аватар от неоднородного фона; `ghost` — без фона.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'shape', 'isOnline'] },
		docs: { source: { code: AVATAR_VARIANTS.map(variant => `<BaseAvatar variant="${variant}" name="Анна Смирнова" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), variants: AVATAR_VARIANTS, anna, ivan }),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseAvatar v-bind="props" :variant="variant" :name="anna.name" />
					<BaseAvatar v-bind="props" :variant="variant" :src="ivan.avatar" :name="ivan.name" />
				</div>
			</div>
		`,
	}),
}

/** Размеры задаются `sizeScale`. Пресеты xs–xl: 24, 28, 32, 36 и 40px — как высота кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'shape', 'isOnline'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseAvatar :size-scale="${preset.sizeScale}" name="Анна Смирнова" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'sizeScale']), presets: SIZE_PRESETS, sizeLabel, anna, ivan }),
		template: `
			<div class="story-row" style="align-items: flex-end;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :size-scale="preset.sizeScale" :name="anna.name" />
					<BaseAvatar v-bind="props" :size-scale="preset.sizeScale" :src="ivan.avatar" :name="ivan.name" />
					<span class="story-label">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}

/** Формы: `circle` — для людей, `square` — для организаций, проектов и каналов. */
export const Shapes: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isOnline'] },
		docs: { source: { code: AVATAR_SHAPES.map(shape => `<BaseAvatar shape="${shape}" name="Анна Смирнова" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'shape']), shapes: AVATAR_SHAPES, anna, maria }),
		template: `
			<div class="story-col">
				<div v-for="shape in shapes" :key="shape" class="story-row">
					<span class="story-label">{{ shape }}</span>
					<BaseAvatar v-bind="props" :shape="shape" :name="anna.name" />
					<BaseAvatar v-bind="props" :shape="shape" :src="maria.avatar" :name="maria.name" />
				</div>
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `bg` — фон, `text` — цвет инициалов. Например, цвет команды или проекта. */
export const CustomColor: Story = {
	args: {
		name: 'Мария Кузнецова',
		color: { bg: { base: '#ede9fe' }, text: { base: '#5b21b6' } },
	},
	play: async ({ canvas }) => {
		const initials = canvas.getByText('МК')
		await expect(getComputedStyle(initials).color).toBe('rgb(91, 33, 182)')
		const content = initials.closest('.base-avatar__content') as HTMLElement
		await expect(getComputedStyle(content).backgroundColor).toBe('rgb(237, 233, 254)')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Изображение из `src` заполняет аватар. `alt` описывает его для скринридеров; пустой `alt` делает изображение декоративным. */
export const WithImage: Story = {
	args: { src: ivan.avatar, alt: ivan.name, name: ivan.name },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: ivan.name })).toHaveAttribute('src', ivan.avatar)
	},
}

/**
 * Запасное содержимое: изображение не загрузилось — инициалы из `name`; нет изображения — тоже инициалы;
 * нет ни изображения, ни имени — «?».
 */
export const Fallback: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale', 'shape'] } },
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), brokenSrc: BROKEN_IMAGE_SRC, ivan }),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :src="brokenSrc" :name="ivan.name" />
					<span class="story-label">Ошибка загрузки</span>
				</div>
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" :name="ivan.name" />
					<span class="story-label">Без изображения</span>
				</div>
				<div class="story-col" style="align-items: center; text-align: center;">
					<BaseAvatar v-bind="props" />
					<span class="story-label">Без имени</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		// После ошибки загрузки изображение заменяется инициалами
		await waitFor(() => expect(canvas.getAllByText('ИП')).toHaveLength(2))
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
		await expect(canvas.getByText('?')).toBeVisible()
	},
}

/** Слот `default` заменяет изображение и инициалы: иконка, счётчик, логотип. */
export const WithSlot: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape'] },
		docs: {
			source: {
				code: ['<BaseAvatar>', '  <BaseIcon name="star" />', '</BaseAvatar>', '<BaseAvatar variant="soft">+3</BaseAvatar>'].join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS) }),
		template: `
			<div class="story-row">
				<BaseAvatar v-bind="props"><BaseIcon name="star" /></BaseAvatar>
				<BaseAvatar v-bind="props" variant="soft">+3</BaseAvatar>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('+3')).toBeVisible()
		// Слот заменяет инициалы: «?» по умолчанию не рендерится
		await expect(canvas.queryByText('?')).not.toBeInTheDocument()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Статус «в сети»: точка цвета success с кольцом цвета фона. Статус передаётся не только цветом —
 * у точки есть доступное имя «в сети».
 */
export const OnlineStatus: Story = {
	args: { isOnline: true },
	parameters: { controls: { include: ['variant', 'sizeScale', 'shape', 'isOnline'] } },
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), anna, oleg }),
		template: `
			<div class="story-row">
				<BaseAvatar v-bind="props" :src="anna.avatar" :name="anna.name" />
				<BaseAvatar v-bind="props" :name="oleg.name" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img', { name: 'в сети' })).toHaveLength(2)
	},
}

/**
 * Группа аватаров: соседние аватары перекрываются, а кольцо цвета фона (`--rise-bg`) разделяет их.
 * Последний аватар со слотом показывает, сколько участников не поместилось.
 */
export const Group: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<div style="display: flex;">',
					'  <BaseAvatar',
					'    v-for="(user, index) in users.slice(0, 3)"',
					'    :key="user.id"',
					'    :src="user.avatar"',
					'    :name="user.name"',
					"    :style=\"{ marginLeft: index ? '-8px' : 0, boxShadow: '0 0 0 2px var(--rise-bg)' }\" />",
					'  <BaseAvatar style="margin-left: -8px; box-shadow: 0 0 0 2px var(--rise-bg)">+{{ users.length - 3 }}</BaseAvatar>',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'isOnline', 'shape']),
			users: STORY_USERS.slice(0, 3),
			rest: STORY_USERS.length - 3,
			ring: '0 0 0 2px var(--rise-bg)',
		}),
		template: `
			<div class="story-row" style="gap: 0;">
				<BaseAvatar
					v-for="(user, index) in users"
					:key="user.id"
					v-bind="props"
					:src="user.avatar"
					:alt="user.name"
					:name="user.name"
					:style="{ marginLeft: index ? '-8px' : 0, boxShadow: ring }" />
				<BaseAvatar v-bind="props" :style="{ marginLeft: '-8px', boxShadow: ring }">+{{ rest }}</BaseAvatar>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img')).toHaveLength(3)
		await expect(canvas.getByText('+2')).toBeVisible()
	},
}
