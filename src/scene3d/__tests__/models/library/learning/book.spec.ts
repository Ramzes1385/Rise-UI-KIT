import { describeLibraryModel } from '../../libraryChecks'
import { buildBook } from '../../../../models/library/learning/book'

describeLibraryModel('book', buildBook, { parts: ['body', 'accent', 'detail', 'light'], animations: [], anchorY: 1.1 })
