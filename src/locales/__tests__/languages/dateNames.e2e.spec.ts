import { expect, test } from '@playwright/test'

/**
 * Названия месяцев и дней kk и uz не зависят от ICU браузера: в Chromium из Playwright (урезанный ICU) казахского нет совсем,
 * у узбекского только корневые данные («M05»), но словарь языка (`calendarNames`) подставляется.
 */
const CASES = [
	{ locale: 'kk', title: 'Мамыр 2025', weekdays: ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс'] },
	{ locale: 'uz', title: 'May 2025', weekdays: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'] },
]

for (const { locale, title, weekdays } of CASES) {
	test(`календарь на ${locale}: месяц и дни недели — по словарю языка`, async ({ page }) => {
		await page.goto(`/iframe.html?id=data-basecalendar--default&viewMode=story&globals=locale:${locale};theme:light;motion:none`)
		const calendar = page.locator('.base-calendar').first()
		await calendar.waitFor({ timeout: 25_000 })
		const text = (await calendar.innerText()).replace(/\s+/g, ' ')
		expect(text).toContain(title)
		for (const weekday of weekdays) expect(text.toLowerCase()).toContain(weekday.toLowerCase())
		expect(text).not.toMatch(/M\d\d|\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/)
	})
}

test('выбор даты на kk: месяц и дни недели в панели — по словарю языка', async ({ page }) => {
	await page.goto('/iframe.html?id=form-basedatepicker--default&viewMode=story&globals=locale:kk;theme:light;motion:none')
	await page.locator('input').first().click()
	const panel = page.locator('.base-calendar').first()
	await panel.waitFor({ timeout: 25_000 })
	const text = (await panel.innerText()).replace(/\s+/g, ' ')
	expect(text).toMatch(/Қаңтар|Ақпан|Наурыз|Сәуір|Мамыр|Маусым|Шілде|Тамыз|Қыркүйек|Қазан|Қараша|Желтоқсан/i)
	expect(text.toLowerCase()).toContain('дс')
	expect(text).not.toMatch(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/)
})
