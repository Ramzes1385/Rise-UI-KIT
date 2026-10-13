import type { Slots } from 'vue'
import { TABLE_SLOTS_KEY } from '../types/BaseTable.types'
import { inject, onBeforeUpdate, provide, ref, useSlots } from 'vue'

const SLOT_NAME = /^(?:cell-|header-|empty$|expanded-content$)/

function snapshotOf(slots: Slots): Array<[string, unknown]> {
	return Object.entries(slots).filter(([name]) => SLOT_NAME.test(name))
}

function isChanged(previous: Array<[string, unknown]>, next: Array<[string, unknown]>): boolean {
	return (
		previous.length !== next.length ||
		next.some(([name, render], index) => previous[index][0] !== name || previous[index][1] !== render)
	)
}

export function provideTableSlots() {
	const slots = useSlots()
	const slotsVersion = ref(0)
	let snapshot = snapshotOf(slots)
	provide(TABLE_SLOTS_KEY, slots)
	onBeforeUpdate(() => {
		const next = snapshotOf(slots)
		if (isChanged(snapshot, next)) slotsVersion.value++
		snapshot = next
	})
	return { slotsVersion }
}

export function useTableSlot(): (name: string) => ((args: object) => unknown) | undefined {
	const slots = inject(TABLE_SLOTS_KEY, {} as Slots)
	return name => slots[name]
}
