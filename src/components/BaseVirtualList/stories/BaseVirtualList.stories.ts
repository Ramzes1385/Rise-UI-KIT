import { args } from './args'
import * as cases from './cases'
import { render } from './render'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { ConcreteComponent } from 'vue'
import type { Meta } from '@storybook/vue3-vite'
import BaseVirtualList from '../ui/BaseVirtualList.vue'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'

const meta = {
	title: 'Data/BaseVirtualList',
	component: BaseVirtualList as unknown as ConcreteComponent<BaseVirtualListProps<Record<string, unknown>>>,
	parameters,
	argTypes,
	args,
	render,
} satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>

export default meta

export const Default = cases.Default
export const VariableHeight = cases.VariableHeight
export const Keyboard = cases.Keyboard
