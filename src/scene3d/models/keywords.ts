/** Данные и утилиты: слова для автоподбора 3D-модели по названию узла (ru/en, без регистра, ё = е) — без three */

import { presetsOfSet } from './presets'
import type { Model3DPresetId, Model3DSet } from '../types/model3d.types'
import type { Model3DWordGroup } from '../types/internal/model3dInternal.types'

/** Основы слов встроенных моделей: мокап FlowModels3D (`models.js`) и фигуры пьедесталов роадмапа */
export const MODEL3D_WORDS: Readonly<Partial<Record<Model3DPresetId, readonly string[]>>> = {
	laptop: ['web', 'веб', 'сайт', 'site', 'frontend', 'витрин', 'browser', 'браузер'],
	phone: ['mobile', 'моб', 'app', 'ios', 'android', 'приложен'],
	gateway: ['gateway', 'gw', 'шлюз', 'api', 'ingress', 'proxy', 'прокси'],
	lock: ['auth', 'авториз', 'login', 'вход', 'sso', 'token', 'токен', 'oauth', 'iam', 'доступ'],
	cart: ['order', 'заказ', 'cart', 'корзин', 'checkout'],
	rack: ['inventory', 'inv', 'склад', 'stock', 'warehouse', 'остат', 'резерв'],
	terminal: ['pay', 'оплат', 'платеж', 'billing', 'биллинг', 'касс'],
	bank: ['bank', 'банк', 'acquir', 'эквайр'],
	bell: ['notif', 'notify', 'уведом', 'push', 'пуш', 'sms', 'смс'],
	ram: ['redis', 'cache', 'кеш', 'кэш', 'memcache', 'session', 'сесси'],
	db: ['postgres', 'pg', 'sql', 'db', 'база', 'бд', 'mysql', 'database'],
	conveyor: ['kafka', 'queue', 'очеред', 'bus', 'шина', 'event', 'событ', 'rabbit', 'stream', 'mq'],
	globe: ['cdn', 'edge', 'static', 'статик', 'раздач'],
	scales: ['balanc', 'балансир', 'lb', 'nginx', 'haproxy'],
	search: ['search', 'поиск', 'elastic', 'index', 'индекс', 'opensearch'],
	analytics: ['analyt', 'аналит', 'bi', 'report', 'отчет', 'dashboard', 'дашборд'],
	bucket: ['s3', 'storage', 'хранил', 'file', 'файл', 'bucket', 'media', 'медиа', 'blob'],
	mailbox: ['mail', 'почт', 'smtp', 'email', 'imap'],
	clock: ['cron', 'schedul', 'планиров', 'timer', 'таймер', 'job', 'задач'],
	scroll: ['log', 'лог', 'журнал', 'audit', 'аудит', 'trace', 'трасс'],
	monitor: ['monitor', 'монитор', 'health', 'метрик', 'metric', 'alert', 'алерт', 'prometheus', 'grafana'],
	ai: ['ai', 'ml', 'llm', 'нейро', 'ии', 'model', 'recommend', 'рекоменд'],
	user: ['user', 'пользоват', 'customer', 'покупат', 'клиент', 'actor', 'человек', 'оператор'],
	cloud: ['external', 'внешн', 'cloud', 'облак', 'saas', 'partner', 'партнер', 'third'],
	window: ['основы веб', 'html', 'css', 'верстк', 'web basics'],
	code: ['javascript', 'js', 'typescript', 'код', 'программир', 'code'],
	gear: ['инструмент', 'tools', 'devops', 'сборк', 'build'],
	layers: ['vue', 'react', 'фреймворк', 'framework', 'компонент', 'component'],
	flask: ['тест', 'test', 'качеств', 'qa', 'quality'],
	rocket: ['продакшн', 'production', 'деплой', 'deploy', 'релиз', 'release'],
	book: ['теори', 'книг', 'book', 'theory', 'введение'],
	shield: ['безопасн', 'security', 'защит'],
	flag: ['цель', 'финиш', 'goal', 'finish'],
}

/** Минимальная длина слова, при которой оно ищется внутри чужого слова; короче — только слово целиком (`ai`, `бд`, `lb`) */
const SUBSTRING_MIN = 4

/** Без регистра, ё = е */
export function normalizeText(text: string): string {
	return text.toLowerCase().replaceAll('ё', 'е')
}

/** Слова текста: буквы и цифры */
export function tokenize(text: string): string[] {
	return normalizeText(text)
		.split(/[^a-z0-9а-я]+/)
		.filter(Boolean)
}

/** Насколько слово подходит тексту: 3 — целое слово, 2 — начало слова, 1 — подстрока, 0 — нет */
export function matchQuality(tokens: readonly string[], text: string, word: string): 0 | 1 | 2 | 3 {
	const needle = normalizeText(word)
	if (needle.includes(' ')) return text.includes(needle) ? 2 : 0
	if (tokens.includes(needle)) return 3
	if (needle.length < 3) return 0
	if (tokens.some(token => token.startsWith(needle))) return 2
	return needle.length >= SUBSTRING_MIN && tokens.some(token => token.includes(needle)) ? 1 : 0
}

function bestQuality(tokens: readonly string[], text: string, words: readonly string[]): number {
	return Math.max(0, ...words.map(word => matchQuality(tokens, text, word)))
}

/**
 * Модель по словам названия и меток: лучшее совпадение (целое слово > начало > подстрока),
 * при равенстве — свои слова раньше встроенных (`rank`), затем порядок групп. Нет совпадений — `null`
 */
export function pickByWords(text: string, groups: readonly Model3DWordGroup[]): string | null {
	const normalized = normalizeText(text)
	const tokens = tokenize(text)
	let best: { id: string; quality: number; rank: number } | null = null
	for (const group of groups) {
		const quality = bestQuality(tokens, normalized, group.words)
		const isBetter = best === null || quality > best.quality || (quality === best.quality && group.rank < best.rank)
		if (quality > 0 && isBetter) best = { id: group.id, quality, rank: group.rank }
	}
	return best?.id ?? null
}

/** Группы слов встроенных моделей наборов в порядке таблицы (`rank` 2) */
export function collectPresetWordGroups(sets: readonly Model3DSet[]): Model3DWordGroup[] {
	return sets.flatMap(set => presetsOfSet(set)).map(id => ({ id, words: MODEL3D_WORDS[id] ?? [], rank: 2 }))
}
