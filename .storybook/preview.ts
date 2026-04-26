/**
 * Глобальная конфигурация Storybook: декораторы, параметры, темы.
 */

import type { Preview } from '@storybook/vue3-vite'

import '../src/app/styles/index.scss'
import '../src/shared/assets/styles/_variables.scss'
import './forced-states.scss'

const preview: Preview = {
	tags: ['autodocs'],

	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		backgrounds: {
			options: {
				light: { name: 'Light', value: '#fafafa' },
				dark: { name: 'Dark', value: '#09090b' },
			},
		},

		a11y: {
			test: 'todo',
		},
	},

	decorators: [
		story => ({
			components: {},
			template: '<story />',
		}),
	],
}

export default preview
