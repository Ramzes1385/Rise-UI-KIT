import { ref } from 'vue'
import { useDismissFocus } from '../useDismissFocus'

function setup(markup: string) {
	document.body.innerHTML = `<div id="root">${markup}</div><button id="after">После</button>`
	const root = document.getElementById('root') as HTMLElement
	return { root, release: useDismissFocus({ elementRef: ref(root) }).releaseFocus }
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('useDismissFocus', () => {
	it('фокус внутри блока переходит на следующий фокусируемый элемент после него', () => {
		const { release } = setup('<button id="inside">Внутри</button>')
		document.getElementById('inside')!.focus()

		release()

		expect(document.activeElement).toBe(document.getElementById('after'))
	})

	it('пропускает элементы внутри блока и скрытые', () => {
		document.body.innerHTML =
			'<div id="root"><button id="a">A</button><button id="b">B</button></div><div hidden><button id="hidden">Скрыта</button></div><a id="link" href="#x">Ссылка</a>'
		const root = document.getElementById('root') as HTMLElement
		document.getElementById('a')!.focus()

		useDismissFocus({ elementRef: ref(root) }).releaseFocus()

		expect(document.activeElement).toBe(document.getElementById('link'))
	})

	it('нет следующего элемента: фокус снимается и уходит в body', () => {
		document.body.innerHTML = '<button id="before">До</button><div id="root"><button id="inside">Внутри</button></div>'
		const root = document.getElementById('root') as HTMLElement
		document.getElementById('inside')!.focus()

		useDismissFocus({ elementRef: ref(root) }).releaseFocus()

		expect(document.activeElement).toBe(document.body)
	})

	it('фокус вне блока не трогается', () => {
		const { release } = setup('<button id="inside">Внутри</button>')
		const outside = document.getElementById('after') as HTMLElement
		outside.focus()

		release()

		expect(document.activeElement).toBe(outside)
	})

	it('блока нет (ref пуст): ничего не происходит', () => {
		const release = useDismissFocus({ elementRef: ref(null) }).releaseFocus

		expect(() => release()).not.toThrow()
	})
})
