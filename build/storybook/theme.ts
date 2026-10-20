/** Цвета — значения токенов светлой темы из src/styles/_tokens.scss. */

import { create } from 'storybook/theming'

export const theme = create({
	base: 'light',

	brandTitle: 'Rise UI Kit',
	brandUrl: 'https://github.com/Ramzes1385/Rise-UI-KIT',
	brandTarget: '_blank',

	colorPrimary: '#c2410c',
	colorSecondary: '#c2410c',

	appBg: '#fafafa',
	appContentBg: '#ffffff',
	appPreviewBg: '#ffffff',
	appBorderColor: '#e4e4e7',
	appBorderRadius: 6,

	// Шрифты кита: в Docs (iframe превью) их @font-face приходят со стилями кита, в интерфейсе Storybook — родовые запасные
	fontBase: "'Rise Grotesk', sans-serif",
	fontCode: "'Rise Mono', monospace",

	textColor: '#18181b',
	textMutedColor: '#71717a',
	textInverseColor: '#ffffff',

	barBg: '#ffffff',
	barTextColor: '#52525b',
	barSelectedColor: '#c2410c',
	barHoverColor: '#c2410c',

	inputBg: '#ffffff',
	inputBorder: '#d4d4d8',
	inputTextColor: '#18181b',
	inputBorderRadius: 6,
})
