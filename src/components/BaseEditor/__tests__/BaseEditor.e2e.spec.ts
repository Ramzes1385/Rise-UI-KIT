import { expect, type Page, test } from '@playwright/test'

const STORY = '/iframe.html?id=editor-baseeditor--empty'

async function openEditor(page: Page) {
	await page.goto(STORY)
	const textbox = page.getByRole('textbox', { name: 'Текстовый редактор' })
	await textbox.waitFor({ timeout: 25000 })
	await page.waitForTimeout(500)
	await textbox.evaluate(element => {
		element.innerHTML = '<p>alpha beta gamma</p>'
		const text = element.querySelector('p')!.firstChild as Text
		window.getSelection()!.setBaseAndExtent(text, text.data.length, text, text.data.length)
		element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
	})
	await page.waitForTimeout(600)
	return textbox
}

test('набор и команда отменяются по шагам настоящими клавишами, повтор — Ctrl+Y и Ctrl+Shift+Z', async ({ page }) => {
	const textbox = await openEditor(page)
	await textbox.click()
	await page.keyboard.press('Control+End')

	await page.keyboard.type(' one')
	await page.keyboard.press('Control+b')
	await page.keyboard.type(' bold')
	await page.waitForTimeout(600)
	await page.keyboard.type(' two')
	await expect(textbox).toContainText('alpha beta gamma one bold two')

	await page.keyboard.press('Control+z')
	await expect(textbox).toContainText('one bold')
	await expect(textbox).not.toContainText('two')
	await page.keyboard.press('Control+z')
	await expect(textbox).toContainText('one')
	await expect(textbox).not.toContainText('bold')
	await page.keyboard.press('Control+z')
	await page.keyboard.press('Control+z')
	await expect(textbox).toHaveText('alpha beta gamma')

	await page.keyboard.press('Control+y')
	await expect(textbox).toContainText('one')
	await page.keyboard.press('Control+Shift+z')
	await page.keyboard.press('Control+Shift+z')
	await expect(textbox).toContainText('bold')
	await expect(textbox).not.toContainText('two')
})

test('перетаскивание выделенного слова — один шаг: Ctrl+Z возвращает слово на место', async ({ page }) => {
	const textbox = await openEditor(page)
	await textbox.dblclick({ position: { x: 60, y: 10 } })
	const selected = await page.evaluate(() => window.getSelection()?.toString().trim())
	expect(selected).toBe('beta')
	const word = await page.evaluate(() => {
		const rect = window.getSelection()!.getRangeAt(0).getBoundingClientRect()
		return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
	})
	const box = (await textbox.boundingBox())!

	await page.mouse.move(word.x, word.y)
	await page.mouse.down()
	await page.mouse.move(word.x + 20, word.y, { steps: 5 })
	await page.mouse.move(box.x + box.width - 20, word.y, { steps: 10 })
	await page.mouse.up()
	await expect(textbox).not.toHaveText('alpha beta gamma')

	await page.keyboard.press('Control+z')

	await expect(textbox).toHaveText('alpha beta gamma')
})

test('нативное historyUndo при непустом стеке гасится и запускает свою отмену', async ({ page }) => {
	const textbox = await openEditor(page)
	await textbox.click()
	await page.keyboard.press('Control+End')
	await page.keyboard.type(' more')
	await expect(textbox).toContainText('more')

	const isPrevented = await textbox.evaluate(element => {
		const event = new InputEvent('beforeinput', { inputType: 'historyUndo', bubbles: true, cancelable: true })
		element.dispatchEvent(event)
		return event.defaultPrevented
	})

	expect(isPrevented).toBe(true)
	await expect(textbox).toHaveText('alpha beta gamma')
})

async function setContent(page: Page, html: string, caret: { selector: string; offset: number; endSelector?: string; endOffset?: number }) {
	const textbox = page.getByRole('textbox', { name: 'Текстовый редактор' })
	await textbox.evaluate(
		(element, args) => {
			element.innerHTML = args.html
			const start = element.querySelector(args.caret.selector)!
			const end = args.caret.endSelector ? element.querySelector(args.caret.endSelector)! : start
			const startNode = start.firstChild ?? start
			const endNode = end.firstChild ?? end
			window.getSelection()!.setBaseAndExtent(startNode, args.caret.offset, endNode, args.caret.endOffset ?? args.caret.offset)
			element.focus()
			element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
		},
		{ html, caret },
	)
	await page.waitForTimeout(300)
	return textbox
}

test('Enter в пустом абзаце даёт один <br> в каждом абзаце', async ({ page }) => {
	await openEditor(page)
	const textbox = await setContent(page, '<p>a</p><p><br></p>', { selector: 'p:last-child', offset: 0 })
	await page.keyboard.press('Enter')
	await expect.poll(() => textbox.innerHTML()).toBe('<p>a</p><p><br></p><p><br></p>')
})

test('Enter поверх выделения через два абзаца склеивает края и делит заново', async ({ page }) => {
	await openEditor(page)
	const textbox = await setContent(page, '<p>hello</p><p>world</p>', {
		selector: 'p:first-child',
		offset: 3,
		endSelector: 'p:last-child',
		endOffset: 2,
	})
	await page.keyboard.press('Enter')
	await expect.poll(() => textbox.innerHTML()).toBe('<p>hel</p><p>rld</p>')
})

test('после «Маркированный список» каретка остаётся в конце своего блока, а не уходит в следующий', async ({ page }) => {
	await openEditor(page)
	const textbox = await setContent(page, '<p>one</p><p>two</p>', { selector: 'p:first-child', offset: 3 })
	await page.getByRole('button', { name: 'Маркированный список' }).click()
	await page.keyboard.type('X')
	await expect.poll(() => textbox.innerHTML()).toBe('<ul><li>oneX</li></ul><p>two</p>')
})

test('Ctrl+B на каретке, уход каретки и ввод: один Ctrl+Z отменяет ввод, невидимых шагов нет', async ({ page }) => {
	await openEditor(page)
	const textbox = await setContent(page, '<p>one two</p>', { selector: 'p', offset: 3 })
	await page.keyboard.press('Control+b')
	await page.keyboard.press('Home')
	await expect(textbox).toContainText('one two')
	expect(await textbox.innerHTML()).toContain('data-rise-pending')

	await page.keyboard.type('Z')
	await expect(textbox).toContainText('Zone two')
	expect(await textbox.innerHTML()).not.toContain('data-rise-pending')
	expect(await textbox.innerHTML()).not.toContain(String.fromCharCode(0x200b))

	await page.keyboard.press('Control+z')
	await expect.poll(() => textbox.evaluate(element => element.textContent!.replaceAll(String.fromCharCode(0x200b), ''))).toBe('one two')
})

test('копирование с заполнителем кладёт в буфер текст без невидимого символа и не меняет DOM', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write'])
	await openEditor(page)
	const textbox = await setContent(page, '<p>one two</p>', { selector: 'p', offset: 3 })
	await page.keyboard.press('Control+b')
	await page.keyboard.press('Home')
	await page.keyboard.press('Shift+End')
	await page.keyboard.press('Control+c')
	const copied = await page.evaluate(() => navigator.clipboard.readText())
	expect(copied).toBe('one two')
	expect(await textbox.innerHTML()).toContain('data-rise-pending')
})
