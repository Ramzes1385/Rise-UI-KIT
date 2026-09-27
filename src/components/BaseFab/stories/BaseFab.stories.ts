/**
 * BaseFab — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, широкая, углы, размеры) → состояния (отключено) → сценарии
 * (ссылка) → клавиатура. Кнопки в примерах стоят в углу рамки (`isContained`), а не окна.
 */

import { expect, fn } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import { FAB_VARIANTS } from '../model/BaseFab.types'
import BaseFab from '../ui/BaseFab.vue'
import type { FabPosition } from '../model/BaseFab.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Рамка «экрана» для кнопки в углу */
const FRAME = 'position: relative; height: 180px; border: 1px dashed var(--rise-border-accented); border-radius: 8px;'

const meta = {
	title: 'Element/BaseFab',
	component: BaseFab,
	parameters: {
		docs: {
			description: {
				component: [
					'Плавающая кнопка главного действия страницы: «Новая задача», «Написать». Стоит в углу окна поверх контента.',
					'',
					'- Круглая с иконкой — имя из `label` (`aria-label`); `isExtended` — широкая с подписью.',
					'- `position` — угол, отступ 24px с учётом безопасной зоны телефона; слой — под окнами и панелями.',
					'- `isContained` — в углу контейнера (`position: absolute`); `to`/`href` — ссылка.',
					'- Одна такая кнопка на экран: для второстепенных действий — обычные кнопки.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: FAB_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isExtended: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		position: { control: 'select', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], table: propGroup(ARG_GROUP.appearance) },
		isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		label: 'Новая задача',
		icon: 'plus',
		isExtended: false,
		position: 'bottom-right',
		isContained: true,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onClick: fn(),
	},
	render: args => ({
		components: { BaseFab },
		setup: () => ({ props: useArgsWithoutSlots(args, []), frame: FRAME }),
		template: '<div :style="frame"><BaseFab v-bind="props" /></div>',
	}),
} satisfies Meta<typeof BaseFab>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: круглая кнопка в правом нижнем углу рамки. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Новая задача' }))
		await expect(args.onClick).toHaveBeenCalledTimes(1)
	},
}

/** Варианты: `default` — заливка, `soft` — мягкий цвет, `outline` — рамка. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'isExtended'] } },
	render: args => ({
		components: { BaseFab },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'position']), variants: FAB_VARIANTS, frame: FRAME, positions: ['bottom-left', 'bottom-right', 'top-left'] as FabPosition[] }),
		template: '<div :style="frame"><BaseFab v-for="(variant, index) in variants" :key="variant" v-bind="props" :variant="variant" :position="positions[index]" :label="variant" /></div>',
	}),
}

/** Широкая кнопка (`isExtended`) с подписью — когда действие неочевидно по иконке. */
export const Extended: Story = {
	args: { isExtended: true, label: 'Написать', icon: 'send' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Написать' })).toHaveTextContent('Написать')
	},
}

/** Размеры через `sizeScale`: 42, 56 и 70px. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseFab },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale', 'position', 'label']), presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)), sizeLabel, frame: FRAME, positions: ['bottom-left', 'top-left', 'bottom-right'] as FabPosition[] }),
		template: '<div :style="frame"><BaseFab v-for="(preset, index) in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :position="positions[index]" :label="sizeLabel(preset)" /></div>',
	}),
}

/** Отключённая кнопка. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Новая задача' })).toBeDisabled()
	},
}

/** Ссылка (`to`): кнопка ведёт на страницу создания. */
export const Link: Story = {
	args: { to: '/tasks/new', isExtended: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Новая задача' })).toHaveAttribute('href', '/tasks/new')
	},
}

/** Клавиатура: кнопка в порядке Tab, Enter и пробел нажимают её. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const fab = canvas.getByRole('button', { name: 'Новая задача' })
		await tabTo(fab, userEvent)
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}
