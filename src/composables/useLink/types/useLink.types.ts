import type { Component } from 'vue'

/** Адрес маршрута: строка или объект для RouterLink (`{ name: 'user', params: { id } }`) */
export type LinkTo = string | Record<string, unknown>

/** Что нужно для ссылки */
export interface LinkOptions {
	/** Маршрут приложения: рендерится компонентом ссылок (RouterLink) или `<a href>` */
	to?: LinkTo
	/** Адрес вне приложения: всегда `<a href>` */
	href?: string
	/** Где открыть (`_blank` — в новой вкладке) */
	target?: string
	/** Отношение к ссылке; для `_blank` всегда добавляется `noopener noreferrer` */
	rel?: string
	/** Ссылка отключена: без адреса, не получает фокус, `aria-disabled` */
	isDisabled?: boolean
}

/** Тег или компонент и атрибуты ссылки */
export interface ResolvedLink {
	/** `a` или компонент ссылок (RouterLink, NuxtLink) */
	is: string | Component
	/** Атрибуты для `v-bind`: href или to, target, rel, aria-disabled */
	attrs: Record<string, unknown>
	/** Есть ли у ссылки адрес */
	hasTarget: boolean
}

/** Компонент ссылок: имя тега или компонент */
export type LinkComponent = string | Component
