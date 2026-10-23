import type { FunctionalComponent, VNodeChild } from 'vue'
import type { TableSlotProps } from '../types/TableSlot.types'

export const TableSlot: FunctionalComponent<TableSlotProps> = (props, { slots }) =>
	props.render ? (props.render(props.args) as VNodeChild) : slots.default?.()

TableSlot.props = ['render', 'args']
