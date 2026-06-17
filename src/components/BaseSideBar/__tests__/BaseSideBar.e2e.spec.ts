import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const STORY_PATH = '/iframe.html?id=ui-basesidebar'

async function openStory(page: Page, storyId: string): Promise<void> {
	await page.goto(`${STORY_PATH}--${storyId}`)
	await page.setViewportSize({ width: 900, height: 640 })
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
}

test.describe('BaseSideBar e2e', () => {
	test('сайдбар: сворачивает и разворачивает по клику на кнопку', async ({ page }) => {
		await openStory(page, 'default')

		const sidebar = page.locator('.base-sidebar')
		const toggle = sidebar.locator('.base-sidebar__toggle')

		await expect(sidebar).not.toHaveClass(/base-sidebar--collapsed/)

		await toggle.click()

		await expect(sidebar).toHaveClass(/base-sidebar--collapsed/)

		await toggle.click()

		await expect(sidebar).not.toHaveClass(/base-sidebar--collapsed/)
	})

	test('сайдбар: controlled v-model управляет состоянием через внешнюю кнопку', async ({ page }) => {
		await openStory(page, 'controlled-v-model')

		const sidebar = page.locator('.base-sidebar')
		const externalToggle = page.getByRole('button', { name: 'Toggle outside' })

		await expect(sidebar).not.toHaveClass(/base-sidebar--collapsed/)
		await expect(page.getByText('isCollapsed: false')).toBeVisible()

		await externalToggle.click()

		await expect(sidebar).toHaveClass(/base-sidebar--collapsed/)
		await expect(page.getByText('isCollapsed: true')).toBeVisible()

		await externalToggle.click()

		await expect(sidebar).not.toHaveClass(/base-sidebar--collapsed/)
		await expect(page.getByText('isCollapsed: false')).toBeVisible()
	})

	test('сайдбар: несворачиваемый сайдбар не имеет кнопки', async ({ page }) => {
		await openStory(page, 'not-collapsible')

		const sidebar = page.locator('.base-sidebar')
		const toggle = sidebar.locator('.base-sidebar__toggle')

		await expect(sidebar).toBeVisible()
		await expect(toggle).toHaveCount(0)
	})

	test('сайдбар: items API рендерит пункты, children и badge', async ({ page }) => {
		await openStory(page, 'with-items-api')

		const sidebar = page.locator('.base-sidebar')

		await expect(sidebar).toBeVisible()
		await expect(sidebar.getByText('Главная')).toBeVisible()
		await expect(sidebar.getByText('Каталог')).toBeVisible()
		await expect(sidebar.getByText('Товары')).toBeVisible()
		await expect(sidebar.getByText('Категории')).toBeVisible()
		await expect(sidebar.getByText('12')).toBeVisible()
	})

	test('сайдбар: activePath подсвечивает parent и current item', async ({ page }) => {
		await openStory(page, 'with-items-api')

		const catalogLink = page
			.getByText('Каталог')
			.locator('xpath=ancestor::*[contains(@class, "base-sidebar-nav__link")]')
		const productsLink = page
			.getByText('Товары')
			.locator('xpath=ancestor::*[contains(@class, "base-sidebar-nav__link")]')

		await expect(catalogLink).toHaveClass(/base-sidebar-nav__link--parent-active/)
		await expect(productsLink).toHaveClass(/base-sidebar-nav__link--current/)
	})

	test('сайдбар: disabled item недоступен', async ({ page }) => {
		await openStory(page, 'with-items-api')

		const disabledItem = page.getByRole('button', { name: 'Недоступно' })

		await expect(disabledItem).toBeDisabled()
	})

	test('сайдбар: collapsed mode показывает иконки, скрывает labels и сохраняет footer', async ({ page }) => {
		await openStory(page, 'collapsed-items')

		const sidebar = page.locator('.base-sidebar')

		await expect(sidebar).toHaveClass(/base-sidebar--collapsed/)
		await expect(sidebar.getByText('Главная')).toHaveCount(0)
		await expect(sidebar.getByText('Товары')).toHaveCount(0)
		await expect(sidebar.getByText('Категории')).toHaveCount(0)
		await expect(sidebar.locator('.base-sidebar-nav__icon').first()).toBeVisible()
		await expect(sidebar.locator('.base-sidebar__footer')).toBeVisible()
		await expect(sidebar.locator('.sidebar-story-profile__avatar')).toBeVisible()
		await expect(sidebar.getByText('Roman Admin')).toHaveCount(1)
	})

	test('сайдбар: collapsed mode показывает tooltip при hover на item', async ({ page }) => {
		await openStory(page, 'collapsed-items')

		const firstItem = page.locator('.base-sidebar-nav__link').first()

		await firstItem.hover()

		await expect(page.getByText('Главная')).toBeVisible()
	})

	test('сайдбар: loading state показывает skeleton и скрывает навигацию', async ({ page }) => {
		await openStory(page, 'loading')

		const sidebar = page.locator('.base-sidebar')

		await expect(sidebar.locator('.base-sidebar__loading')).toBeVisible()
		await expect(sidebar.locator('.base-sidebar__navigation')).toHaveCount(0)
	})

	test('сайдбар: dark theme применяет dark canvas и компонент остаётся видимым', async ({ page }) => {
		await openStory(page, 'dark-theme')

		await expect(page.locator('.sidebar-story-canvas--dark')).toBeVisible()
		await expect(page.locator('.base-sidebar')).toBeVisible()
	})

	test('сайдбар: variant stories рендерят все варианты', async ({ page }) => {
		await openStory(page, 'variants')

		await expect(page.locator('.base-sidebar')).toHaveCount(5)

		for (const variant of ['ghost', 'outline', 'shadow', 'soft']) {
			await expect(page.locator(`.base-sidebar--${variant}`).first()).toBeVisible()
		}
	})

	test('сайдбар: collapsed variants рендерят свёрнутые варианты', async ({ page }) => {
		await openStory(page, 'collapsed-variants')

		const sidebars = page.locator('.base-sidebar')

		await expect(sidebars.first()).toBeVisible()
		await expect(sidebars.first()).toHaveClass(/base-sidebar--collapsed/)
	})

	test('сайдбар: custom item slot работает', async ({ page }) => {
		await openStory(page, 'with-custom-item-slot')

		await expect(page.locator('.sidebar-story-custom-button').first()).toBeVisible()
	})

	test('сайдбар: navigation slot имеет приоритет над items', async ({ page }) => {
		await openStory(page, 'navigation-slot-priority')

		await expect(page.getByText('Кастомная главная')).toBeVisible()
		await expect(page.getByText('Кастомный каталог')).toBeVisible()
	})

	test('сайдбар: занимает всю высоту родительского контейнера', async ({ page }) => {
		await openStory(page, 'full-height-layout')

		const wrapper = page.locator('.sidebar-story-full-height')
		const sidebar = page.locator('.base-sidebar')

		const wrapperBox = await wrapper.boundingBox()
		const sidebarBox = await sidebar.boundingBox()

		expect(Math.round(sidebarBox?.height ?? 0)).toBe(Math.round(wrapperBox?.height ?? 0))
	})

	test('сайдбар: disclosure group раскрывает и скрывает children', async ({ page }) => {
		await openStory(page, 'disclosure-groups')

		const settingsButton = page.getByRole('button', { name: 'Настройки' })

		await expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
		await expect(page.getByText('Профиль')).toHaveCount(0)

		await settingsButton.click()

		await expect(settingsButton).toHaveAttribute('aria-expanded', 'true')
		await expect(page.getByText('Профиль')).toBeVisible()

		await settingsButton.click()

		await expect(settingsButton).toHaveAttribute('aria-expanded', 'false')
		await expect(page.getByText('Профиль')).toHaveCount(0)
	})
})
