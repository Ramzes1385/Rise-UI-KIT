import '../foundations.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Конструктор темы',
	id: 'foundations-theme-builder',
	parameters,
} satisfies Meta

export default meta

export const Builder = cases.Builder
