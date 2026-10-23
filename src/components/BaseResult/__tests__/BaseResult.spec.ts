import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import BaseResult from '../ui/BaseResult.vue'
import { UI_RESULT } from '@/locales/messages'
import { render, screen } from '@testing-library/vue'
import { RESULT_STATUSES } from '../types/BaseResult.types'
import type { ResultStatus } from '../types/BaseResult.types'

const root = () => document.querySelector('.base-result') as HTMLElement
const part = (name: string) => root().querySelector(`.base-result__${name}`)

const TITLES: Record<ResultStatus, () => string> = {
	success: () => UI_RESULT.TITLE_SUCCESS,
	info: () => UI_RESULT.TITLE_INFO,
	warning: () => UI_RESULT.TITLE_WARNING,
	error: () => UI_RESULT.TITLE_ERROR,
	'403': () => UI_RESULT.TITLE_403,
	'404': () => UI_RESULT.TITLE_404,
	'500': () => UI_RESULT.TITLE_500,
}
const DESCRIPTIONS: Partial<Record<ResultStatus, () => string>> = {
	'403': () => UI_RESULT.DESCRIPTION_403,
	'404': () => UI_RESULT.DESCRIPTION_404,
	'500': () => UI_RESULT.DESCRIPTION_500,
}
const ROLE_CLASSES: Record<ResultStatus, string> = {
	success: 'success',
	info: 'info',
	warning: 'warning',
	error: 'error',
	'403': 'warning',
	'404': 'info',
	'500': 'error',
}

afterEach(() => setLocale('ru'))

describe('BaseResult: тексты по умолчанию', () => {
	it.each(RESULT_STATUSES)('статус %s: заголовок и описание из словаря', status => {
		render(BaseResult, { props: { status } })

		expect(screen.getByRole('heading', { level: 2, name: TITLES[status]() })).toBeInTheDocument()
		const description = DESCRIPTIONS[status]?.()
		if (description) expect(screen.getByText(description)).toBeInTheDocument()
		else expect(part('description')).not.toBeInTheDocument()
	})

	it('статус по умолчанию — info', () => {
		render(BaseResult)

		expect(screen.getByRole('heading', { name: UI_RESULT.TITLE_INFO })).toBeInTheDocument()
		expect(root()).toHaveClass('base-result--info')
	})

	it('по-английски тексты берутся из английского словаря', () => {
		setLocale('en')
		render(BaseResult, { props: { status: '404' } })

		expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
		expect(screen.getByText('The address may be mistyped or the page may have been removed.')).toBeInTheDocument()
	})

	it.each(RESULT_STATUSES)('по-английски статус %s даёт английский заголовок', status => {
		setLocale('en')
		render(BaseResult, { props: { status } })

		expect(screen.getByRole('heading', { name: TITLES[status]() })).toBeInTheDocument()
		expect(TITLES[status]()).toMatch(/^[A-Za-z]/)
	})
})

describe('BaseResult: иконка и код', () => {
	it.each(['403', '404', '500'] as const)('статус %s показывает код без иконки', status => {
		render(BaseResult, { props: { status } })

		expect(screen.getByText(status)).toHaveAttribute('aria-hidden', 'true')
		expect(root().querySelector('.base-icon')).not.toBeInTheDocument()
	})

	it.each(['success', 'info', 'warning', 'error'] as const)('статус %s показывает иконку', status => {
		render(BaseResult, { props: { status } })

		expect(root().querySelector('.base-icon')).toBeInTheDocument()
		expect(part('code')).not.toBeInTheDocument()
	})

	it('проп icon заменяет иконку статуса', () => {
		render(BaseResult, { props: { status: 'success', icon: 'star' } })

		expect(root().querySelector('use')?.getAttribute('href')).toBe('icons.svg#star')
	})

	it('проп icon у 404 заменяет код иконкой', () => {
		render(BaseResult, { props: { status: '404', icon: 'search' } })

		expect(screen.queryByText('404')).not.toBeInTheDocument()
		expect(root().querySelector('use')?.getAttribute('href')).toBe('icons.svg#search')
	})

	it('слот icon заменяет и код, и иконку', () => {
		render(BaseResult, { props: { status: '500' }, slots: { icon: '<svg data-testid="art" />' } })

		expect(screen.getByTestId('art')).toBeInTheDocument()
		expect(screen.queryByText('500')).not.toBeInTheDocument()
		expect(root().querySelector('.base-icon')).not.toBeInTheDocument()
	})
})

describe('BaseResult: роль и вид', () => {
	it.each(RESULT_STATUSES)('статус %s даёт класс роли', status => {
		render(BaseResult, { props: { status } })

		expect(root()).toHaveClass(`base-result--${ROLE_CLASSES[status]}`)
	})

	it('variant добавляет модификатор', () => {
		render(BaseResult, { props: { variant: 'soft' } })

		expect(root()).toHaveClass('base-result--soft')
	})

	it('sizeScale 125 пишет --size-scale', () => {
		render(BaseResult, { props: { sizeScale: 125 } })

		expect(root().style.getPropertyValue('--size-scale')).toBe('1.25')
	})
})

describe('BaseResult: содержимое', () => {
	it('title и description переопределяют тексты по умолчанию', () => {
		render(BaseResult, { props: { status: '404', title: 'Свой заголовок', description: 'Своё описание' } })

		expect(screen.getByRole('heading', { name: 'Свой заголовок' })).toBeInTheDocument()
		expect(screen.getByText('Своё описание')).toBeInTheDocument()
		expect(screen.queryByText(UI_RESULT.TITLE_404)).not.toBeInTheDocument()
		expect(screen.queryByText(UI_RESULT.DESCRIPTION_404)).not.toBeInTheDocument()
	})

	it('слоты title и description заменяют проп', () => {
		render(BaseResult, {
			props: { title: 'Проп', description: 'Проп описания' },
			slots: { title: 'Из слота', description: 'Описание из слота' },
		})

		expect(screen.getByRole('heading', { name: 'Из слота' })).toBeInTheDocument()
		expect(screen.getByText('Описание из слота')).toBeInTheDocument()
		expect(screen.queryByText('Проп описания')).not.toBeInTheDocument()
	})

	it('слот description создаёт описание там, где его нет по умолчанию', () => {
		render(BaseResult, { props: { status: 'success' }, slots: { description: 'Платёж принят' } })

		expect(screen.getByText('Платёж принят')).toBeInTheDocument()
	})

	it.each(['success', 'info', 'warning', 'error'] as const)('статус %s без description не рисует описание', status => {
		render(BaseResult, { props: { status } })

		expect(root().querySelector('p')).not.toBeInTheDocument()
	})

	it('слот default рендерит блок подробностей', () => {
		render(BaseResult, { slots: { default: '<span>Код ошибки 42</span>' } })

		expect(part('body')).toContainElement(screen.getByText('Код ошибки 42'))
	})

	it('без слота default блока подробностей нет', () => {
		render(BaseResult)

		expect(part('body')).not.toBeInTheDocument()
	})

	it('слот extra рендерит блок действий', () => {
		render(BaseResult, { slots: { extra: '<button type="button">На главную</button>' } })

		expect(part('extra')).toContainElement(screen.getByRole('button', { name: 'На главную' }))
	})

	it('без слота extra блока действий нет', () => {
		render(BaseResult)

		expect(part('extra')).not.toBeInTheDocument()
	})
})

describe('BaseResult: titleTag', () => {
	it('по умолчанию заголовок — h2', () => {
		render(BaseResult)

		expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
	})

	it.each(['h1', 'h3', 'h6'] as const)('titleTag %s рисует заголовок нужного уровня', tag => {
		render(BaseResult, { props: { titleTag: tag } })

		expect(screen.getByRole('heading', { level: Number(tag[1]) })).toBeInTheDocument()
	})

	it.each(['p', 'div'] as const)('titleTag %s не даёт заголовка', tag => {
		render(BaseResult, { props: { titleTag: tag } })

		expect(screen.queryByRole('heading')).not.toBeInTheDocument()
		expect(part('title')?.tagName).toBe(tag.toUpperCase())
	})
})

describe('BaseResult: isLive', () => {
	it('без isLive роли нет', () => {
		render(BaseResult, { props: { status: 'error' } })

		expect(root()).not.toHaveAttribute('role')
	})

	it.each([
		['success', 'status'],
		['info', 'status'],
		['warning', 'alert'],
		['error', 'alert'],
		['403', 'alert'],
		['404', 'status'],
		['500', 'alert'],
	] as const)('isLive: статус %s даёт role=%s', (status, role) => {
		render(BaseResult, { props: { status, isLive: true } })

		expect(root()).toHaveAttribute('role', role)
	})
})

describe('BaseResult: customClass, ui и defaults плагина', () => {
	it('customClass строкой добавляется к корню', () => {
		render(BaseResult, { props: { customClass: 'own-root' } })

		expect(root()).toHaveClass('own-root')
	})

	it('customClass объектом добавляет классы частям', () => {
		render(BaseResult, {
			props: { status: '404', customClass: { root: 'c-root', title: 'c-title', code: 'c-code', iconWrapper: 'c-wrap' } },
		})

		expect(root()).toHaveClass('c-root')
		expect(part('title')).toHaveClass('c-title')
		expect(part('code')).toHaveClass('c-code')
		expect(part('icon-wrapper')).toHaveClass('c-wrap')
	})

	it('проп ui добавляет классы частям к классам кита', () => {
		render(BaseResult, {
			props: { status: '404', ui: { root: 'u-root', title: 'u-title', description: 'u-description', content: 'u-content' } },
		})

		expect(root()).toHaveClass('base-result', 'u-root')
		expect(part('title')).toHaveClass('u-title')
		expect(part('description')).toHaveClass('u-description')
		expect(part('content')).toHaveClass('u-content')
	})

	it('ui из defaults плагина склеивается с ui экземпляра', () => {
		render(BaseResult, {
			props: { ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseResult: { ui: { root: 'app-root', title: 'app-title' } } } })] },
		})

		expect(root()).toHaveClass('app-root', 'own-root')
		expect(part('title')).toHaveClass('app-title')
	})

	it('defaults плагина переопределяют значения по умолчанию', () => {
		render(BaseResult, {
			global: { plugins: [createUiKitPlugin({ defaults: { BaseResult: { status: '404', titleTag: 'h1', isLive: true } } })] },
		})

		expect(screen.getByRole('heading', { level: 1, name: UI_RESULT.TITLE_404 })).toBeInTheDocument()
		expect(root()).toHaveClass('base-result--info')
		expect(root()).toHaveAttribute('role', 'status')
	})

	it('проп экземпляра сильнее defaults плагина', () => {
		render(BaseResult, {
			props: { status: '500' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseResult: { status: '404' } } })] },
		})

		expect(screen.getByRole('heading', { name: UI_RESULT.TITLE_500 })).toBeInTheDocument()
	})
})
