#!/usr/bin/env python3
"""Шрифты Rise UI Kit: woff2 и @font-face кита из исходников google/fonts (все шрифты — SIL OFL 1.1).

Что пишет (src/styles/fonts):
- files/ и _fonts.scss — Rise Grotesk (Space Grotesk; кириллица, № ₸ и стрелки — Onest, 96 %), Rise Mono (Space Mono;
  кириллица, ₽ № ₸ ʻ ʼ и стрелки — IBM Plex Mono 400/700, 102 %) и знаки интерфейса для обоих семейств (⌘ ⌥ ⇧ ↵ ⋮ ∈ … — Noto Sans
  Symbols 2, Noto Sans Math и Noto Sans Symbols);
- cjk/sc, cjk/jp, cjk/zh.css, cjk/ja.css — Rise CJK SC (Noto Sans SC) и Rise CJK JP (Noto Sans JP): wght 400–700, частотные
  иероглифы, нарезка по unicode-range — первым куском знаки словаря кита и пунктуация, дальше ярусы частоты Google Fonts.

Метрики запасных начертаний (кириллица, знаки, CJK) подогнаны под основное (ascent/descent-override): строка со смешанным
письмом не становится выше. Подмножество IBM Plex Mono переименовано («Plex» — зарезервированное имя, OFL, п. 3).

Нужны Python 3.10+, fontTools ≥ 4.47 и brotli (`pip install fonttools brotli`) и доступ к raw.githubusercontent.com —
в зависимости пакета они не входят. Запуск из корня репозитория:

    python3 -I build/fonts/build_fonts.py --cache <папка для исходников>             # всё
    python3 -I build/fonts/build_fonts.py --cache <папка> --only cjk                   # только CJK (после правки словарей zh и ja)
    npx prettier --write src/styles/fonts/_fonts.scss 'src/styles/fonts/cjk/*.css'

Исходники скачиваются в --cache и сверяются по SHA-256: другой файл — остановка (обновление шрифта — осознанно, с новым хешем).
Список дзёё-кандзи (2136, редакция 2010 г.) — joyo.txt рядом (по x0213.org, пакет npm joyo-kanji, MIT).
"""

from __future__ import annotations

import argparse
import hashlib
import io
import re
import sys
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
FONTS = ROOT / 'src/styles/fonts'
FILES = FONTS / 'files'
CJK = FONTS / 'cjk'
LOCALES = ROOT / 'src/locales'

GF = 'https://raw.githubusercontent.com/google/fonts/main/ofl/'
NAM = 'https://raw.githubusercontent.com/googlefonts/nam-files/main/slices/'

SOURCES = {
    'space-grotesk': (GF + 'spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf', 'acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72'),
    'onest': (GF + 'onest/Onest%5Bwght%5D.ttf', '966c5c29b4755da84b6854d5c21dd4eaa2420225d0e9874de602de176d4a9f31'),
    'space-mono-400': (GF + 'spacemono/SpaceMono-Regular.ttf', '95837e182baeeada83368f7748db28357f0a1b75c6b84ff7065b5edf933c8e18'),
    'space-mono-700': (GF + 'spacemono/SpaceMono-Bold.ttf', '405e73d41afb7e5906efce206a326af5c956f38e255f35421c260e861e599c59'),
    'plex-mono-400': (GF + 'ibmplexmono/IBMPlexMono-Regular.ttf', '6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46'),
    'plex-mono-700': (GF + 'ibmplexmono/IBMPlexMono-Bold.ttf', 'ac27abd6450a64dd94467580a02fe6235156d5b92f2926ebbc8e7489df64e0be'),
    'noto-symbols2': (GF + 'notosanssymbols2/NotoSansSymbols2-Regular.ttf', '7d5fb73b7ca67a6798101741f5d280a3d016a56a197afcd4199dbb57b4b82a21'),
    'noto-math': (GF + 'notosansmath/NotoSansMath-Regular.ttf', '3f495fe933c06786e4d5f6d86b8ee70b6753a68ee3b9d87528726de0f6e2c47d'),
    'noto-symbols': (GF + 'notosanssymbols/NotoSansSymbols%5Bwght%5D.ttf', 'f7e7e04b4a24b6c78893d50cbfd2b2f6cae49617ab047bfef668d252adb128f7'),
    'noto-sc': (GF + 'notosanssc/NotoSansSC%5Bwght%5D.ttf', 'a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da'),
    'noto-jp': (GF + 'notosansjp/NotoSansJP%5Bwght%5D.ttf', 'c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f'),
    'slices-sc': (NAM + 'simplified-chinese_default.txt', 'cd022036048744a478b2d261131a90400bacbb9098b83efd0360f1e44122c2c1'),
    'slices-jp': (NAM + 'japanese_default.txt', '3032f27de94485ab2885c14b927b35d12e31a281ad4eb287b9ec28fe45b8509d'),
}

CYRILLIC = [(0x0400, 0x052F), (0x1C80, 0x1C8A), (0x2DE0, 0x2DFF), (0xA640, 0xA69F), (0x2116, 0x2116), (0x20B8, 0x20B8), (0x2190, 0x2199)]
# ₽ и узбекские ʻ ʼ (oʻ, maʼlumot): в Space Mono их нет
MONO_CYRILLIC = CYRILLIC + [(0x20BD, 0x20BD), (0x02BB, 0x02BC)]

# Знаки интерфейса, которых нет в основных шрифтах: клавиши (BaseKbd, подсказки сочетаний в словарях), меню «⋮», операции
# фильтра таблицы и нотации EPC — их показывает кит; отметки, фигуры, стрелки и математика — частые в тексте интерфейсов.
# Источник — первый шрифт, где знак есть; у каждого семейства в unicode-range — только знаки, которых нет в его основных файлах.
# Набор больше 4 КБ: сборщик приложения (Vite, assetsInlineLimit) не встраивает файл в CSS как data: дважды (по семейству).
SYMBOLS = '⌘⌥⌃⌄⇧⇪⌫⌦↵⏎⎋⇥⇤⋮⋯∈∉∋∧∨✓✔✕✖✗✘●○◆◇■□▲△▼▽▶▷◀◁★☆⇄⇅⇐⇒⇔⇑⇓⟵⟶↺↻⚠✎✉☰⏸⏹'
SYMBOL_SOURCES = ['noto-symbols2', 'noto-math', 'noto-symbols']

CJK_WEIGHTS = (400, 700)
# Ярусы частоты в файлах нарезки Google Fonts: у SC — 20 по ≈190 знаков, у JP — 60 по ≈50; дальше — корзины по коду
FREQ_TIERS = {'sc': 20, 'jp': 60}
# Кусок частотной части — от 150 знаков (ярусы, почти целиком ушедшие в кусок кита, склеиваются), хвост по кодам — по ≈200
SLICE_MIN = 150
SLICE_TARGET = 200
VERTICAL = ('vert', 'vrt2', 'vkna', 'vhal', 'vpal', 'valt')


def fetch(cache: Path, key: str) -> Path:
    url, digest = SOURCES[key]
    path = cache / f'{key}{Path(url.split("?")[0]).suffix}'
    if not path.exists():
        print(f'  скачиваю {url}', flush=True)
        with urllib.request.urlopen(url) as response:
            path.write_bytes(response.read())
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != digest:
        sys.exit(f'{key}: SHA-256 {actual}, ожидался {digest} — исходник изменился ({url})')
    return path


def expand(ranges: list[tuple[int, int]]) -> set[int]:
    return {cp for start, end in ranges for cp in range(start, end + 1)}


def unicode_range(cps: set[int]) -> str:
    """`U+0401-040C, U+2116, …` — подряд идущие коды схлопываются в диапазон"""
    out, ordered = [], sorted(cps)
    start = prev = ordered[0]
    for cp in ordered[1:] + [None]:
        if cp is not None and cp == prev + 1:
            prev = cp
            continue
        out.append(f'U+{start:04X}' if start == prev else f'U+{start:04X}-{prev:04X}')
        if cp is not None:
            start = prev = cp
    return ', '.join(out)


def options(*, flavor: str | None = 'woff2', features: list[str] | None = None, hinting: bool = True, names=None) -> subset.Options:
    opts = subset.Options()
    opts.flavor = flavor
    opts.layout_features = features if features is not None else ['*']
    opts.name_IDs = names if names is not None else ['*']
    opts.hinting = hinting
    opts.notdef_outline = True
    opts.glyph_names = False
    opts.drop_tables += ['vhea', 'vmtx', 'VORG', 'VVAR', 'meta', 'MATH']
    return opts


def cut(font: TTFont, cps: set[int], opts: subset.Options) -> TTFont:
    subsetter = subset.Subsetter(opts)
    subsetter.populate(unicodes=cps)
    subsetter.subset(font)
    return font


def save(font: TTFont, path: Path) -> set[int]:
    """WOFF2 без новой метки времени в head: повторный запуск на тех же исходниках даёт те же байты"""
    path.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = 'woff2'
    font.recalcTimestamp = False
    font.save(path)
    return set(TTFont(path).getBestCmap())


def rename(font: TTFont, family: str, style: str) -> None:
    """Имя подмножества: записи семейства, начертания, полного и PostScript-имени и уникального ID. Подмножество IBM Plex Mono —
    без зарезервированного имени «Plex»; у CJK после сужения оси wght — «Regular» вместо имени исходного начертания по умолчанию (Thin)"""
    table = font['name']
    postscript = f'{family.replace(" ", "")}-{style.replace(" ", "")}'
    for name_id in (1, 2, 3, 4, 6, 16, 17, 21, 22, 25):
        table.removeNames(nameID=name_id)
    legacy = family if style == 'Regular' else f'{family} {style}'
    for name_id, value in ((1, legacy), (2, 'Regular'), (3, f'{postscript};Rise UI Kit'), (4, f'{family} {style}'), (6, postscript)):
        table.setName(value, name_id, 3, 1, 0x409)
    if style != 'Regular':
        table.setName(family, 16, 3, 1, 0x409)
        table.setName(style, 17, 3, 1, 0x409)
    leftovers = [record.toUnicode() for record in table.names if record.nameID not in (0, 7) and 'Plex' in record.toUnicode()]
    if leftovers:
        sys.exit(f'{family}: в записях name осталось зарезервированное имя: {leftovers}')


def metrics(path: Path) -> tuple[float, float]:
    """ascent и descent основного начертания в долях em (hhea; у Space Grotesk и Space Mono они равны typo)"""
    font = TTFont(path, lazy=True)
    upm = font['head'].unitsPerEm
    return font['hhea'].ascent / upm, -font['hhea'].descent / upm


def overrides(base: tuple[float, float], size: float = 1.0) -> dict[str, str]:
    """ascent/descent-override, при которых запасное начертание (с `size-adjust`) даёт ту же высоту строки, что основное"""
    ascent, descent = base
    percent = lambda value: f'{value / size * 100:.2f}'.rstrip('0').rstrip('.') + '%'
    return {'ascent-override': percent(ascent), 'descent-override': percent(descent), 'line-gap-override': '0%'}


def face(family: str, url: str, weight: str, *, size: str | None = None, extra: dict[str, str] | None = None, cps: set[int] | None = None) -> str:
    lines = [
        '@font-face {',
        f"\tfont-family: '{family}';",
        '\tfont-style: normal;',
        f'\tfont-weight: {weight};',
        '\tfont-display: block;',
        f"\tsrc: url('{url}') format('woff2');",
    ]
    if size:
        lines.append(f'\tsize-adjust: {size};')
    for key, value in (extra or {}).items():
        lines.append(f'\t{key}: {value};')
    if cps is not None:
        lines.append(f'\tunicode-range: {unicode_range(cps)};')
    lines.append('}')
    return '\n'.join(lines)


def build_base(cache: Path) -> None:
    """Rise Grotesk, Rise Mono и знаки интерфейса: files/*.woff2 и _fonts.scss"""
    print('Rise Grotesk и Rise Mono', flush=True)
    grotesk = TTFont(fetch(cache, 'space-grotesk'))
    grotesk_cps = save(cut(grotesk, set(grotesk.getBestCmap()), options(hinting=True)), FILES / 'rise-grotesk.woff2')
    onest = TTFont(fetch(cache, 'onest'))
    onest_cps = save(cut(onest, expand(CYRILLIC), options()), FILES / 'rise-grotesk-cyrillic.woff2')
    mono_cps = set()
    for weight in ('400', '700'):
        mono = TTFont(fetch(cache, f'space-mono-{weight}'))
        mono_cps |= save(cut(mono, set(mono.getBestCmap()), options()), FILES / f'rise-mono-{weight}.woff2')
    plex_cps = set()
    for weight, style in (('400', 'Regular'), ('700', 'Bold')):
        plex = cut(TTFont(fetch(cache, f'plex-mono-{weight}')), expand(MONO_CYRILLIC), options(names=[0, 1, 2, 3, 4, 5, 6, 13, 14]))
        rename(plex, 'Rise Mono Cyrillic', style)
        plex_cps = save(plex, FILES / f'rise-mono-cyrillic-{weight}.woff2')
    symbol_cps = build_symbols(cache)

    sans = metrics(fetch(cache, 'space-grotesk'))
    mono_base = metrics(fetch(cache, 'space-mono-400'))
    # Браузер подбирает начертание по насыщенности и только потом — файл по unicode-range: у начертаний одного семейства с разной
    # насыщенностью наборы знаков не складываются. Поэтому у каждой насыщенности Rise Mono — полный набор (латиница, кириллица,
    # знаки) с одинаковым font-weight: 400 и 700 (Bold IBM Plex Mono по толщине штриха совпадает с Bold Space Mono, Medium заметно светлее);
    # 500 браузер берёт из 400, 600 — из 700.
    mono_symbols = symbol_cps - mono_cps - plex_cps
    faces = [
        face('Rise Grotesk', './files/rise-grotesk.woff2?no-inline', '300 700'),
        face('Rise Grotesk', './files/rise-grotesk-cyrillic.woff2?no-inline', '300 700', size='96%', extra=overrides(sans, 0.96), cps=onest_cps),
        face('Rise Grotesk', './files/rise-symbols.woff2?no-inline', '300 700', extra=overrides(sans), cps=symbol_cps - grotesk_cps - onest_cps),
    ]
    for weight in ('400', '700'):
        faces += [
            face('Rise Mono', f'./files/rise-mono-{weight}.woff2?no-inline', weight),
            face('Rise Mono', f'./files/rise-mono-cyrillic-{weight}.woff2?no-inline', weight, size='102%', extra=overrides(mono_base, 1.02), cps=plex_cps),
            face('Rise Mono', './files/rise-symbols.woff2?no-inline', weight, extra=overrides(mono_base), cps=mono_symbols),
        ]
    header = [
        '// Шрифты кита — файл пишет build/fonts/build_fonts.py, руками не править. Лицензии — THIRD_PARTY_NOTICES.md рядом.',
        '// Rise Grotesk: латиница — Space Grotesk, кириллица, № ₸ и стрелки — Onest (96 %); Rise Mono: латиница — Space Mono,',
        '// кириллица, ₽ № ₸ ʻ ʼ и стрелки — IBM Plex Mono (102 %); у обоих знаки клавиш и меню — Noto Sans Symbols 2, Math, Symbols.',
        '// Метрики запасных начертаний — как у основного: строка со смешанным письмом не выше обычной.',
        '// `?no-inline`: в сборке библиотеки Vite иначе вставил бы файлы в CSS как data: URI (build/config/build.lib.ts, «Шрифты»).',
        '',
    ]
    (FONTS / '_fonts.scss').write_text('\n'.join(header) + '\n\n'.join(faces) + '\n', encoding='utf8')


def build_symbols(cache: Path) -> set[int]:
    sources = {}
    for key in SYMBOL_SOURCES:
        font = TTFont(fetch(cache, key))
        if 'fvar' in font:
            font = instancer.instantiateVariableFont(font, {'wght': 400})
        sources[key] = font
    picks: dict[str, set[int]] = {}
    for char in SYMBOLS:
        key = next((key for key in SYMBOL_SOURCES if ord(char) in sources[key].getBestCmap()), None)
        if key is None:
            sys.exit(f'знака {char} (U+{ord(char):04X}) нет ни в одном источнике')
        picks.setdefault(key, set()).add(ord(char))
    parts = []
    for key, cps in picks.items():
        font = cut(sources[key], cps, options(flavor=None, features=[], hinting=False, names=[0, 1, 2, 3, 4, 5, 6, 13, 14]))
        for tag in ('GSUB', 'GPOS', 'GDEF'):
            if tag in font:
                del font[tag]
        buffer = io.BytesIO()
        font.recalcTimestamp = False
        font.save(buffer)
        buffer.seek(0)
        parts.append(buffer)
    merged = Merger().merge(parts)
    stamp = max(sources[key]['head'].modified for key in picks)
    merged['head'].created = merged['head'].modified = stamp
    copyright_ = '; '.join(dict.fromkeys(sources[key]['name'].getDebugName(0) for key in picks))
    merged['name'].removeNames(nameID=0)
    merged['name'].setName(copyright_, 0, 3, 1, 0x409)
    rename(merged, 'Rise Symbols', 'Regular')
    return save(merged, FILES / 'rise-symbols.woff2')


def is_han(cp: int) -> bool:
    return 0x3400 <= cp <= 0x4DBF or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0x20000 <= cp <= 0x3134F


def locale_chars(code: str) -> set[int]:
    """Знаки словаря кита (кроме латиницы и кириллицы — их рисует Rise Grotesk)"""
    return {ord(char) for path in (LOCALES / code).rglob('*.ts') for char in path.read_text(encoding='utf8') if ord(char) >= 0x2000}


def gb2312_level1() -> set[int]:
    chars = set()
    for high in range(0xB0, 0xD8):
        for low in range(0xA1, 0xFF):
            try:
                chars.add(ord(bytes([high, low]).decode('gb2312')))
            except UnicodeDecodeError:
                continue
    return chars


def jis_level1() -> set[int]:
    chars = set()
    for high in range(0xB0, 0xD0):
        for low in range(0xA1, 0xFF):
            try:
                char = bytes([high, low]).decode('euc_jp')
            except UnicodeDecodeError:
                continue
            if is_han(ord(char)):
                chars.add(ord(char))
    return chars


def joyo() -> set[int]:
    return {ord(char) for char in (Path(__file__).parent / 'joyo.txt').read_text(encoding='utf8').strip()}


def google_tiers(path: Path) -> list[list[int]]:
    """Куски нарезки Google Fonts от самого частого (в файле они в обратном порядке)"""
    tiers, current = [], None
    for line in path.read_text(encoding='utf8').splitlines():
        if line.startswith('subsets {'):
            current = []
        elif line.strip() == '}' and current is not None:
            tiers.append(current)
            current = None
        elif current is not None and (match := re.match(r'\s*codepoints: (\d+)', line)):
            current.append(int(match.group(1)))
    return tiers[::-1]


def cjk_charset(lang: str, tiers: list[list[int]]) -> set[int]:
    """SC: GB2312 уровня 1 + 20 ярусов частоты; JP: дзёё + JIS X 0208 уровня 1 + 60 ярусов + кана; обоим — пунктуация CJK,
    полноширинные формы и знаки словаря кита. Латиница, кириллица и общая пунктуация (< U+2000) — у Rise Grotesk."""
    top = {cp for tier in tiers[: FREQ_TIERS[lang]] for cp in tier}
    if lang == 'sc':
        chars = gb2312_level1() | top | locale_chars('zh')
    else:
        chars = joyo() | jis_level1() | top | locale_chars('ja') | expand([(0x3041, 0x3096), (0x3099, 0x30FF), (0x31F0, 0x31FF)])
    chars |= expand([(0x3000, 0x303F), (0xFF01, 0xFF5E), (0xFFE0, 0xFFE6)])
    return {cp for cp in chars if cp >= 0x2000}


def plan_slices(lang: str, chars: set[int], tiers: list[list[int]]) -> list[set[int]]:
    """Первый кусок — знаки словаря кита и пунктуация (интерфейс кита — один файл), дальше — ярусы частоты Google Fonts
    (от SLICE_MIN знаков в куске), последними — остальные знаки по порядку кодов, по ≈SLICE_TARGET"""
    kit = (locale_chars('zh' if lang == 'sc' else 'ja') | expand([(0x3000, 0x303F), (0xFF01, 0xFF5E), (0xFFE0, 0xFFE6)])) & chars
    slices, rest, current = [kit], chars - kit, set()
    for tier in tiers[: FREQ_TIERS[lang]]:
        current |= {cp for cp in tier if cp in rest}
        if len(current) >= SLICE_MIN:
            slices.append(current)
            rest -= current
            current = set()
    if current:
        slices.append(current)
        rest -= current
    ordered = sorted(rest)
    count = max(1, round(len(ordered) / SLICE_TARGET))
    size = -(-len(ordered) // count)
    slices += [set(ordered[index : index + size]) for index in range(0, len(ordered), size)]
    return [chunk for chunk in slices if chunk]


def build_cjk(cache: Path, lang: str) -> None:
    family, code, source = {'sc': ('Rise CJK SC', 'zh', 'noto-sc'), 'jp': ('Rise CJK JP', 'ja', 'noto-jp')}[lang]
    print(family, flush=True)
    tiers = google_tiers(fetch(cache, f'slices-{lang}'))
    font = TTFont(fetch(cache, source))
    chars = cjk_charset(lang, tiers) & set(font.getBestCmap())
    features = [feature for feature in subset.Options().layout_features if feature not in VERTICAL]
    font = cut(font, chars, options(flavor=None, features=features, hinting=False, names=[0, 1, 2, 3, 4, 5, 6, 13, 14]))
    font = instancer.instantiateVariableFont(font, {'wght': CJK_WEIGHTS})
    rename(font, f'Noto Sans {lang.upper()}', 'Regular')
    buffer = io.BytesIO()
    font.recalcTimestamp = False
    font.save(buffer)
    folder = CJK / lang
    for old in folder.glob('*.woff2'):
        old.unlink()
    sans = metrics(fetch(cache, 'space-grotesk'))
    faces, total = [], 0
    for index, cps in enumerate(plan_slices(lang, chars, tiers)):
        piece = cut(TTFont(io.BytesIO(buffer.getvalue())), cps, options(flavor=None, features=features, hinting=False))
        path = folder / f'rise-cjk-{lang}-{index:02d}.woff2'
        have = save(piece, path)
        total += path.stat().st_size
        weight = f'{CJK_WEIGHTS[0]} {CJK_WEIGHTS[1]}'
        faces.append(face(family, f'./{lang}/{path.name}', weight, extra=overrides(sans), cps=have))
        print(f'  {path.name}: {len(have)} знаков, {path.stat().st_size / 1024:.0f} КБ', flush=True)
    header = (
        f'/* {family} — Noto Sans {lang.upper()} (SIL OFL 1.1, © Adobe; THIRD_PARTY_NOTICES.md), wght {CJK_WEIGHTS[0]}–{CJK_WEIGHTS[1]}, '
        f'{len(chars)} знаков в {len(faces)} файлах. Файл пишет build/fonts/build_fonts.py — руками не править. */\n'
    )
    (CJK / f'{code}.css').write_text(header + '\n\n'.join(faces) + '\n', encoding='utf8')
    print(f'  всего {len(chars)} знаков, {total / 1024:.0f} КБ', flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--cache', required=True, type=Path, help='папка для скачанных исходников')
    parser.add_argument('--only', choices=['base', 'cjk'], help='только Rise Grotesk и Rise Mono или только CJK')
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    if args.only != 'cjk':
        build_base(args.cache)
    if args.only != 'base':
        build_cjk(args.cache, 'sc')
        build_cjk(args.cache, 'jp')


if __name__ == '__main__':
    main()
