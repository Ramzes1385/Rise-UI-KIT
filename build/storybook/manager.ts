/** Подключает тему Rise UI Kit к интерфейсу Storybook. */

import { addons } from 'storybook/manager-api'
import { theme } from './theme'

addons.setConfig({
	theme,
	sidebar: {
		showRoots: true,
	},
})
