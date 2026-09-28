import BaseKbd from '../ui/BaseKbd.vue'
import { expect } from 'storybook/test'
import { KBD_VARIANTS } from '../types/BaseKbd.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

const meta = {
	title: 'Element/BaseKbd',
	component: BaseKbd,
	parameters: {
		docs: {
			description: {
				component: [
					'Клавиша в тексте и подсказках: «Нажмите Ctrl + K», сочетание у пункта меню.',
					'',
					'- Разметка — `<kbd>`. Служебные клавиши (`meta`, `shift`, `enter`, стрелки…) показываются символом, скринридер слышит название.',
					'- `meta` и `alt` на macOS — ⌘ и ⌥, на других системах — Ctrl и Alt (`platform` задаёт систему явно).',
					'- Сочетание — несколько BaseKbd подряд; знак «+» между ними ставит приложение.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: KBD_VARIANTS }),
		value: { control: 'text', table: propGroup(ARG_GROUP.content) },
		platform: { control: 'inline-radio', options: ['mac', 'other'], table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		value: 'K',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseKbd v-bind="props" />',
	}),
} satisfies Meta<typeof BaseKbd>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: клавиша из `value`. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const kbd = canvasElement.querySelector('kbd') as HTMLElement
		await expect(kbd).toHaveTextContent('K')
	},
}

/** Варианты: `default` — клавиша с гранью, `outline` — рамка, `soft` — фон, `ghost` — текст. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: KBD_VARIANTS }),
		template: '<div class="story-row"><BaseKbd v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" /></div>',
	}),
}

/** Размеры через `sizeScale`. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant'] } },
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale']), presets: SIZE_PRESETS, sizeLabel }),
		template:
			'<div class="story-row"><span v-for="preset in presets" :key="preset.name" class="story-row" style="gap: 4px;"><BaseKbd v-bind="props" :size-scale="preset.sizeScale" /><span class="story-label">{{ sizeLabel(preset) }}</span></span></div>',
	}),
}

/**
 * Служебные клавиши: символ на экране, название для скринридера. На macOS `meta` — ⌘, `alt` — ⌥; на других
 * системах — Ctrl и Alt.
 */
export const SpecialKeys: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseKbd },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['value', 'platform']),
			keys: [
				'meta',
				'ctrl',
				'alt',
				'shift',
				'enter',
				'backspace',
				'delete',
				'escape',
				'tab',
				'space',
				'arrowup',
				'arrowdown',
				'arrowleft',
				'arrowright',
			],
		}),
		template: `
			<div class="story-stack">
				<div class="story-row"><span class="story-label">macOS</span><BaseKbd v-for="key in keys" :key="key" v-bind="props" :value="key" platform="mac" /></div>
				<div class="story-row"><span class="story-label">Windows, Linux</span><BaseKbd v-for="key in keys" :key="key" v-bind="props" :value="key" platform="other" /></div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [macMeta] = canvasElement.querySelectorAll('kbd')
		await expect(macMeta).toHaveTextContent('⌘Command')
	},
}

/** Сочетание в тексте: «Нажмите Ctrl + K, чтобы открыть поиск». */
export const Shortcut: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['value', 'platform']) }),
		template:
			'<p style="margin: 0;">Нажмите <BaseKbd v-bind="props" value="meta" platform="other" /> + <BaseKbd v-bind="props" value="K" />, чтобы открыть поиск</p>',
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('kbd')).toHaveLength(2)
		await expect(canvasElement.querySelector('p')).toHaveTextContent('Нажмите Ctrl + K, чтобы открыть поиск')
	},
}
