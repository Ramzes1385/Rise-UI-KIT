import '../composables.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Composables/useSortable',
	parameters,
} satisfies Meta

export default meta

export const Basic = cases.Basic
