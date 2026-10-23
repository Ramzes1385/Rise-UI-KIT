import { warn } from '@/locales/warn'
import type { PropType, VNode } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import { cloneVNode, Comment, defineComponent, Fragment, h, mergeProps, Text } from 'vue'

function flatten(nodes: VNode[]): VNode[] {
	return nodes.flatMap(node => (node.type === Fragment && Array.isArray(node.children) ? flatten(node.children as VNode[]) : [node]))
}

function findTrigger(nodes: VNode[]): VNode | undefined {
	return flatten(nodes).find(node => node.type !== Comment && node.type !== Text)
}

function joinTokens(...values: unknown[]): string | undefined {
	const tokens = values.flatMap(value => (typeof value === 'string' ? value.split(/\s+/) : [])).filter(Boolean)
	return tokens.length ? [...new Set(tokens)].join(' ') : undefined
}

function toElement(target: unknown): HTMLElement | null {
	const element = (target as { $el?: unknown } | null)?.$el ?? target
	return element instanceof HTMLElement ? element : null
}

export const TooltipRoot = defineComponent({
	name: 'TooltipRoot',
	inheritAttrs: false,
	props: {
		isWrapperless: { type: Boolean, default: false },
		wrapperClass: { type: [String, Array] as PropType<string | (string | undefined)[]>, default: undefined },
		handlers: { type: Object as PropType<Record<string, unknown>>, required: true },
		describedBy: { type: String, default: undefined },
		setElement: { type: Function as PropType<(element: HTMLElement | null) => void>, required: true },
	},
	setup(props, { slots, attrs }) {
		let isWarned = false
		const setRef = (target: unknown): void => {
			const element = toElement(target)
			if (props.isWrapperless && target && !element && !isWarned) {
				isWarned = true
				warn(UI_WARNINGS.TOOLTIP_WRAPPERLESS_ROOT)
			}
			props.setElement(element)
		}

		return () => {
			const popup = slots.popup?.() ?? []
			if (!props.isWrapperless) {
				const root = mergeProps(attrs, { ref: setRef, class: props.wrapperClass }, props.handlers)
				return h('span', root, [...(slots.trigger?.() ?? []), ...popup])
			}
			const trigger = findTrigger(slots.trigger?.() ?? [])
			if (!trigger) return popup
			const describedby = joinTokens(trigger.props?.['aria-describedby'], attrs['aria-describedby'], props.describedBy)
			const extra = mergeProps(attrs, props.handlers, { 'aria-describedby': describedby, ref: setRef })
			return [cloneVNode(trigger, extra, true), ...popup]
		}
	},
})
