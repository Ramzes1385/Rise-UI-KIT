import { progressOf } from '../fixtures/roadmapFixtures'
import { createLocalStorageProgress } from '../../../model/progress/localStorageProgress'

const progress = progressOf({ a: { status: 'done' } })

function fakeStorage(overrides: Partial<Storage> = {}): Storage {
	const store = new Map<string, string>()
	return {
		getItem: key => store.get(key) ?? null,
		setItem: (key, value) => void store.set(key, value),
		...overrides,
	} as Storage
}

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
	localStorage.clear()
})

describe('createLocalStorageProgress', () => {
	it('сохраняет и загружает прогресс по ключу с префиксом rise-roadmap:', () => {
		const storage = createLocalStorageProgress()
		storage.save('vue', progress)
		expect(JSON.parse(localStorage.getItem('rise-roadmap:vue') ?? '')).toEqual(progress)
		expect(storage.load('vue')).toEqual(progress)
	})

	it('свой префикс', () => {
		createLocalStorageProgress({ prefix: 'app:' }).save('vue', progress)
		expect(localStorage.getItem('app:vue')).not.toBeNull()
		expect(localStorage.getItem('rise-roadmap:vue')).toBeNull()
	})

	it('своё хранилище вместо localStorage', () => {
		const custom = fakeStorage()
		const storage = createLocalStorageProgress({ storage: custom })
		storage.save('vue', progress)
		expect(custom.getItem('rise-roadmap:vue')).not.toBeNull()
		expect(localStorage.getItem('rise-roadmap:vue')).toBeNull()
		expect(storage.load('vue')).toEqual(progress)
	})

	it('load: нет записи — null', () => {
		expect(createLocalStorageProgress().load('none')).toBeNull()
	})

	it('load: битый JSON и не прогресс — null', () => {
		const storage = createLocalStorageProgress()
		localStorage.setItem('rise-roadmap:bad', '{не json')
		localStorage.setItem('rise-roadmap:alien', '{"foo":1}')
		expect(storage.load('bad')).toBeNull()
		expect(storage.load('alien')).toBeNull()
	})

	it('load: getItem бросает — null', () => {
		const storage = createLocalStorageProgress({
			storage: fakeStorage({
				getItem: () => {
					throw new Error('нет доступа')
				},
			}),
		})
		expect(storage.load('vue')).toBeNull()
	})

	it('load нормализует прочитанное', () => {
		localStorage.setItem('rise-roadmap:vue', JSON.stringify({ version: 1, topics: { a: { status: 'bogus', subtopics: ['x', 1] } } }))
		expect(createLocalStorageProgress().load('vue')).toEqual({ version: 1, topics: { a: { subtopics: ['x'] } } })
	})

	it('SSR: нет window — load даёт null, save бросает «Хранилище прогресса недоступно»', () => {
		vi.stubGlobal('window', undefined)
		const storage = createLocalStorageProgress()
		expect(storage.load('vue')).toBeNull()
		expect(() => storage.save('vue', progress)).toThrow('Хранилище прогресса недоступно')
	})

	it('доступ к window.localStorage бросает (запрет cookies) — как нет хранилища', () => {
		vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
			throw new Error('SecurityError')
		})
		const storage = createLocalStorageProgress()
		expect(storage.load('vue')).toBeNull()
		expect(() => storage.save('vue', progress)).toThrow('Хранилище прогресса недоступно')
	})

	it('save: setItem бросает (квота) — ошибка уходит наружу', () => {
		const storage = createLocalStorageProgress({
			storage: fakeStorage({
				setItem: () => {
					throw new Error('QuotaExceededError')
				},
			}),
		})
		expect(() => storage.save('vue', progress)).toThrow('QuotaExceededError')
	})
})
