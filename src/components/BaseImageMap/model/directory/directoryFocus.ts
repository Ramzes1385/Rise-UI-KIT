const SEARCH_SELECTOR = '.base-image-map__search input'
const ENTRY_SELECTOR = '[data-image-map-entry]'

export function focusDirectoryStart(root: HTMLElement | null, isEntryFirst: boolean): void {
	const directory = root?.querySelector('.base-image-map__directory')
	const search = directory?.querySelector<HTMLElement>(SEARCH_SELECTOR) ?? null
	const entry = directory?.querySelector<HTMLElement>(ENTRY_SELECTOR) ?? null
	const target = isEntryFirst ? (entry ?? search) : (search ?? entry)
	target?.focus({ preventScroll: true })
}

export function keepFocusInDirectory(root: HTMLElement | null, row: EventTarget | null): void {
	if (!(row instanceof HTMLElement) || row.isConnected) return
	focusDirectoryStart(root, true)
}
