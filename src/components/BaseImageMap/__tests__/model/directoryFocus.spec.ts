import { focusDirectoryStart, keepFocusInDirectory } from '../../model/directory/directoryFocus'

function mount(html: string): HTMLElement {
	const root = document.createElement('div')
	root.innerHTML = `<aside class="base-image-map__directory">${html}</aside>`
	document.body.append(root)
	return root
}

const SEARCH = '<div class="base-image-map__search"><input aria-label="search" /></div>'
const ENTRY = '<button data-image-map-entry="a">A</button>'

describe('directoryFocus', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('focusDirectoryStart: поиск или первая строка — по приоритету, с откатом на другое', () => {
		const both = mount(SEARCH + ENTRY)
		focusDirectoryStart(both, false)
		expect(document.activeElement).toBe(both.querySelector('input'))
		focusDirectoryStart(both, true)
		expect(document.activeElement).toBe(both.querySelector('button'))
		const onlySearch = mount(SEARCH)
		focusDirectoryStart(onlySearch, true)
		expect(document.activeElement).toBe(onlySearch.querySelector('input'))
		const onlyEntry = mount(ENTRY)
		focusDirectoryStart(onlyEntry, false)
		expect(document.activeElement).toBe(onlyEntry.querySelector('button'))
	})

	it('focusDirectoryStart: без списка и без корня ничего не делает', () => {
		const empty = mount('')
		const before = document.activeElement
		focusDirectoryStart(empty, true)
		focusDirectoryStart(null, false)
		focusDirectoryStart(document.createElement('div'), false)
		expect(document.activeElement).toBe(before)
	})

	it('keepFocusInDirectory: только если строка исчезла', () => {
		const root = mount(SEARCH + ENTRY)
		const row = root.querySelector('button') as HTMLElement
		keepFocusInDirectory(root, row)
		expect(document.activeElement).not.toBe(row)
		keepFocusInDirectory(root, null)
		expect(document.activeElement).not.toBe(row)
		const gone = document.createElement('button')
		keepFocusInDirectory(root, gone)
		expect(document.activeElement).toBe(row)
	})
})
