import type { MarqueeStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { MARQUEE_DIRECTIONS, MARQUEE_VARIANTS } from '../types/BaseMarquee.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MARQUEE_VARIANTS }),
	direction: { control: 'inline-radio', options: MARQUEE_DIRECTIONS, table: propGroup(ARG_GROUP.behavior) },
	speed: { control: { type: 'range', min: 0, max: 200, step: 10 }, table: propGroup(ARG_GROUP.behavior) },
	gap: { control: { type: 'number', min: 0, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
	hasFade: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasPauseButton: { control: 'boolean', table: propGroup(ARG_GROUP.a11y) },
	isPaused: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	items: { control: false, table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Содержимое ленты, когда `items` не переданы'),
	item: slotArgType('Вид элемента из `items`: `{ item, index }`'),
	separator: slotArgType('Разделитель после каждого элемента из `items`'),
} satisfies Meta<MarqueeStoryArgs>['argTypes']
