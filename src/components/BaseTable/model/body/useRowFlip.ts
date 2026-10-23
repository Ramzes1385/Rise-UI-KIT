import { watch } from 'vue'
import type { Ref } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { BaseTableBodyProps } from '../../types/body/BaseTableBody.types'

const ORDER_SEPARATOR = '\u0000'

function rowElements(tbody: HTMLElement | null): HTMLElement[] {
	return [...(tbody?.querySelectorAll<HTMLElement>(':scope > tr.base-table__tr') ?? [])]
}

function measure(tbody: HTMLElement | null): Map<HTMLElement, number> {
	return new Map(rowElements(tbody).map(row => [row, row.getBoundingClientRect().top]))
}

function shiftOf(row: HTMLElement, tops: Map<HTMLElement, number>): number {
	const before = tops.get(row)
	return before === undefined ? 0 : before - row.getBoundingClientRect().top
}

export function useRowFlip(tbodyRef: Ref<HTMLElement | null>, props: Pick<BaseTableBodyProps, 'rows' | 'isVirtual'>): void {
	const motion = useMotion(tbodyRef)
	const order = (): string => props.rows.map(row => row.id).join(ORDER_SEPARATOR)
	let tops = new Map<HTMLElement, number>()

	watch(
		order,
		() => {
			tops = props.isVirtual || motion.isReduced.value ? new Map() : measure(tbodyRef.value)
		},
		{ flush: 'pre' },
	)
	watch(
		order,
		() => {
			if (!tops.size) return
			const timing = { duration: motion.duration('slow'), easing: motion.easing('emphasized') }
			for (const row of rowElements(tbodyRef.value)) {
				const shift = shiftOf(row, tops)
				if (shift) row.animate?.([{ transform: `translateY(${shift}px)` }, { transform: 'none' }], timing)
			}
			tops = new Map()
		},
		{ flush: 'post' },
	)
}
