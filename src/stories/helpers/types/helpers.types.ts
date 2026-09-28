import type { ARG_GROUP } from '../argTypes'
import type { userEvent as defaultUserEvent } from 'storybook/test'

export type ArgGroup = (typeof ARG_GROUP)[keyof typeof ARG_GROUP]

export interface BaseArgTypesOptions {
	/** Допустимые варианты оформления (константа `<X>_VARIANTS`). Без них контрол variant не создаётся. */
	variants?: readonly string[]
}

export interface PlaceholderOptions {
	width?: number
	height?: number
	/** Оттенок HSL 0–360: задаёт палитру иллюстрации. */
	hue?: number
}

export type UserEvent = Pick<typeof defaultUserEvent, 'tab'>
