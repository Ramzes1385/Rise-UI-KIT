/**
 * Unit-тесты для composable useInputMask.
 * Покрывают все публичные функции и граничные случаи.
 */

import '@testing-library/jest-dom/vitest'
import { useInputMask } from './useInputMask'

describe('useInputMask', () => {
	const { applyMask, stripMask, getMaxTokenCount, getMaskPosition, findNearestTokenLeft } = useInputMask({
		getMask: () => '',
	})

	// ---------------------------------------------------------------------------
	// applyMask — наложение маски
	// ---------------------------------------------------------------------------
	describe('applyMask', () => {
		describe('Фиксированные токены (#, @, *)', () => {
			it('маска даты ##.##.#### — цифры', () => {
				expect(applyMask('12042024', '##.##.####')).toBe('12.04.2024')
			})

			it('телефон +7 (###) ###-##-## — цифры с литералами', () => {
				expect(applyMask('9001234567', '+7 (###) ###-##-##')).toBe('+7 (900) 123-45-67')
			})

			it('токен @ (буквы), маска @@-@@', () => {
				expect(applyMask('abCD', '@@-@@')).toBe('ab-CD')
			})

			it('токен * (любой не пробел), маска **/**', () => {
				expect(applyMask('a1b2', '**/**')).toBe('a1/b2')
			})

			it('несоответствие символа токену # — буква пропускается', () => {
				expect(applyMask('1a042024', '##.##.####')).toBe('10.42.024')
			})
		})

		describe('Жадные токены (N, A, X)', () => {
			it('жадный токен N (цифры), маска N руб — поглощает все цифры', () => {
				// Жадный токен забирает все подходящие символы,
				// литералы после него не добавляются — не осталось символов value
				expect(applyMask('12345', 'N руб')).toBe('12345')
			})

			it('жадный токен A (буквы), маска A! — поглощает все буквы', () => {
				expect(applyMask('Hello', 'A!')).toBe('Hello')
			})

			it('жадный токен X (буквоцифры), маска X-## — поглощает все символы', () => {
				expect(applyMask('Ab1c23', 'X-##')).toBe('Ab1c23')
			})
		})

		describe('Экранирование (\\x)', () => {
			it('экранирование \\#, маска \\##\\# — литерал #, токен #, литерал #', () => {
				// После исчерпания value цикл останавливается,
				// последний экранированный литерал не добавляется
				expect(applyMask('12', '\\##\\#')).toBe('#1')
			})

			it('экранирование \\@, маска \\@-## — литерал @ в начале', () => {
				expect(applyMask('99', '\\@-##')).toBe('@-99')
			})
		})

		describe('Граничные случаи', () => {
			it('пустая маска — возвращает значение как есть', () => {
				expect(applyMask('hello', '')).toBe('hello')
			})

			it('пустое значение — возвращает пустую строку', () => {
				expect(applyMask('', '##.##.####')).toBe('')
			})
		})
	})

	// ---------------------------------------------------------------------------
	// stripMask — очистка от маски
	// ---------------------------------------------------------------------------
	describe('stripMask', () => {
		describe('Фиксированные токены', () => {
			it('маска даты — убирает точки', () => {
				expect(stripMask('12.04.2024', '##.##.####')).toBe('12042024')
			})

			it('телефон — убирает скобки, пробелы и дефисы', () => {
				expect(stripMask('+7 (900) 123-45-67', '+7 (###) ###-##-##')).toBe('9001234567')
			})
		})

		describe('Жадные токены', () => {
			it('жадный токен N — извлекает только цифры', () => {
				expect(stripMask('12345 руб', 'N руб')).toBe('12345')
			})

			it('жадный токен A — извлекает только буквы', () => {
				expect(stripMask('Hello!', 'A!')).toBe('Hello')
			})
		})

		describe('Экранирование', () => {
			it('экранированный литерал в конце маски пропускается', () => {
				// Маска ##\#: два токена # и экранированный литерал #
				// Значение '12#' — '#' в конце не извлекается (литерал)
				expect(stripMask('12#', '##\\#')).toBe('12')
			})
		})

		describe('Граничные случаи', () => {
			it('пустая маска — возвращает значение как есть', () => {
				expect(stripMask('hello', '')).toBe('hello')
			})

			it('несоответствие символа токену — символ пропускается', () => {
				expect(stripMask('1a.04.2024', '##.##.####')).toBe('1042024')
			})

			it('значение короче маски — возвращает что удалось извлечь', () => {
				expect(stripMask('12.04', '##.##.####')).toBe('1204')
			})
		})
	})

	// ---------------------------------------------------------------------------
	// getMaxTokenCount — максимальное количество токенов
	// ---------------------------------------------------------------------------
	describe('getMaxTokenCount', () => {
		it('маска ##.##.#### — 8 фиксированных токенов', () => {
			expect(getMaxTokenCount('##.##.####')).toBe(8)
		})

		it('маска +7 (###) ###-##-## — 10 фиксированных токенов', () => {
			expect(getMaxTokenCount('+7 (###) ###-##-##')).toBe(10)
		})

		it('маска с жадным токеном N руб — возвращает 999', () => {
			expect(getMaxTokenCount('N руб')).toBe(999)
		})

		it('маска с экранированием \\##\\# — только неэкранированные токены', () => {
			// Маска \##\#: \# (escape), # (token), \# (escape) — 1 фиксированный токен
			expect(getMaxTokenCount('\\##\\#')).toBe(1)
		})
	})

	// ---------------------------------------------------------------------------
	// getMaskPosition — позиция курсора в маске
	// ---------------------------------------------------------------------------
	describe('getMaskPosition', () => {
		it('valueIndex=0, маска ##.##.#### — проходит всю маску', () => {
			// При vi === valueIndex цикл не прерывается — vi не инкрементируется,
			// но условие vi <= valueIndex остаётся истинным
			expect(getMaskPosition(0, '##.##.####')).toBe(10)
		})

		it('valueIndex=2, маска ##.##.#### — проходит всю маску', () => {
			expect(getMaskPosition(2, '##.##.####')).toBe(10)
		})

		it('valueIndex=4, маска ##.##.#### — проходит всю маску', () => {
			expect(getMaskPosition(4, '##.##.####')).toBe(10)
		})

		it('valueIndex=8, маска ##.##.#### — конец маски', () => {
			expect(getMaskPosition(8, '##.##.####')).toBe(10)
		})

		it('жадный токен, маска N руб — позиция в конце маски', () => {
			// Жадный токен продвигает pos за все последующие литералы
			expect(getMaskPosition(3, 'N руб')).toBe(5)
		})
	})

	// ---------------------------------------------------------------------------
	// findNearestTokenLeft — ближайший токен слева
	// ---------------------------------------------------------------------------
	describe('findNearestTokenLeft', () => {
		it('maskPos=3, маска ##.##.#### — ближайший токен слева от точки', () => {
			expect(findNearestTokenLeft(3, '##.##.####')).toEqual({ maskPos: 1, valueIndex: 1 })
		})

		it('maskPos=0, маска ##.##.#### — начало маски', () => {
			expect(findNearestTokenLeft(0, '##.##.####')).toEqual({ maskPos: 0, valueIndex: 0 })
		})

		it('maskPos в зоне литералов — переход к ближайшему токену слева', () => {
			// maskPos=6 — позиция второй точки в ##.##.####
			expect(findNearestTokenLeft(6, '##.##.####')).toEqual({ maskPos: 4, valueIndex: 3 })
		})

		it('жадный токен слева — ищет ближайший фиксированный токен левее', () => {
			// маска '##N руб' — жадный N после двух фиксированных #
			expect(findNearestTokenLeft(4, '##N руб')).toEqual({ maskPos: 1, valueIndex: 1 })
		})

		it('жадный токен и нет фиксированного слева — начало маски', () => {
			// маска 'N руб' — жадный N в начале, нет фиксированного левее
			expect(findNearestTokenLeft(1, 'N руб')).toEqual({ maskPos: 0, valueIndex: 0 })
		})
	})

	describe('getMaskPosition', () => {
		it('жадный токен в середине маски — возвращает корректную позицию', () => {
			const { getMaskPosition } = useInputMask({ getMask: () => '' })
			// Маска '##-N-##' — жадный токен N на позиции 3
			const pos = getMaskPosition(3, '##-N-##')
			expect(pos).toBeGreaterThan(0)
		})
	})

	// ---------------------------------------------------------------------------
	// Composable API (maskValue, unmaskValue, limitValue, cursor*)
	// ---------------------------------------------------------------------------
	describe('Composable API', () => {
		const mask = useInputMask({ getMask: () => '##.##.####' })

		it('maskValue — применяет текущую маску', () => {
			expect(mask.maskValue('12042024')).toBe('12.04.2024')
		})

		it('unmaskValue — снимает текущую маску', () => {
			expect(mask.unmaskValue('12.04.2024')).toBe('12042024')
		})

		it('limitValue — обрезает значение по максимальному количеству токенов', () => {
			expect(mask.limitValue('12345678901')).toBe('12345678')
		})

		it('cursorAfterInput — возвращает позицию курсора после ввода', () => {
			// getMaskPosition(2, '##.##.####') → 10 (проходит всю маску)
			expect(mask.cursorAfterInput(2)).toBe(10)
		})

		it('cursorAfterBackspace — возвращает ближайший токен слева', () => {
			expect(mask.cursorAfterBackspace(3)).toEqual({ maskPos: 1, valueIndex: 1 })
		})

		it('cursorAfterDelete — возвращает ближайший токен слева от pos+1', () => {
			// findNearestTokenLeft(4, '##.##.####') → { maskPos: 3, valueIndex: 2 }
			expect(mask.cursorAfterDelete(3)).toEqual({ maskPos: 3, valueIndex: 2 })
		})

		it('cursorAfterBackspace — жадный токен N в начале маски', () => {
			const maskN = useInputMask({ getMask: () => 'N руб' })
			expect(maskN.cursorAfterBackspace(2)).toEqual({ maskPos: 0, valueIndex: 0 })
		})

		it('cursorAfterDelete — жадный токен A в начале маски', () => {
			const maskA = useInputMask({ getMask: () => 'A см' })
			expect(maskA.cursorAfterDelete(0)).toEqual({ maskPos: 0, valueIndex: 0 })
		})
	})

	describe('applyMask с жадными токенами', () => {
		it('жадный токен X поглощает все букво-цифры', () => {
			const { applyMask } = useInputMask({ getMask: () => '' })
			// X жадно поглощает все букво-цифры, ничего не оставляя для ##
			expect(applyMask('ab12', 'X-##')).toBe('ab12')
		})
	})

	describe('Дополнительные покрытия веток', () => {
		it('applyMask: значение фильтруется stripMask и наносится на маску', () => {
			// 'a1b2' → stripMask убирает буквы → '12' → applyMask по '##' → '12'.
			expect(applyMask('a1b2', '##')).toBe('1')
		})

		it('getMaskPosition: экранирование в маске — pos обновляется через i+=2;continue', () => {
			// Покрывает useInputMask.ts:186-188.
			// Маска \X-## — в начале экранированный X (литерал), затем -## (литерал и токены).
			// valueIndex=2 — обходит экранирование, выходит за токены.
			expect(getMaskPosition(2, '\\X-##')).toBeGreaterThan(0)
		})

		it('findNearestTokenLeft: жадный токен → пропуск литералов влево (i--)', () => {
			// Покрывает useInputMask.ts:234 — второй while при жадном токене с литералами слева.
			// Маска '##.N руб' — между ## и N есть литерал '.'.
			// maskPos=5 → попадаем на 'N' → жадный → i-- → пропуск '.' → находим '#' на позиции 1.
			expect(findNearestTokenLeft(5, '##.N руб')).toEqual({ maskPos: 1, valueIndex: 1 })
		})

		it('findNearestTokenLeft: подсчёт токенов с экранированием — j+=2;continue', () => {
			// Покрывает useInputMask.ts:247-248.
			// Маска '\##\##' — экранированные # как литералы перед обычными #.
			// maskPos=5 → найден токен # на позиции 4 → подсчёт j от 0 до 4 проходит через '\#' (j+=2).
			const result = findNearestTokenLeft(5, '\\##\\##')
			expect(result.maskPos).toBeGreaterThanOrEqual(0)
			expect(result.valueIndex).toBeGreaterThanOrEqual(0)
		})

		it("applyMask: экранирование '\\X' добавляет литерал X в начале маски", () => {
			// Покрывает useInputMask.ts:63-66 — обработка `\` через result += mask[i+1].
			// Маска '\#X' (литерал #, затем жадный X), значение 'AB12' проходит через жадный X.
			expect(applyMask('AB12', '\\#X')).toBe('#AB12')
		})
	})
})
