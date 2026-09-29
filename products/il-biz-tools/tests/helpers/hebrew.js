// Hebrew copy rules shared by the page tests.

/**
 * Masculine-singular address forms. The site addresses its readers in the plural ("הזינו", "שלכם"), never as
 * one man ("הזן", "שלך"). A catalogue of the forms a tool page would reach for, not a grammar: third-person
 * statutory wording ("הוא מעסיק עובדים") is not address and is not matched.
 */
export const MASCULINE_SINGULAR =
  /(?:^|[\s(,.:;"'״–-])(?:אתה|שלך|לך|אותך|עליך|בשבילך|תבדוק|תשתמש|תזין|הזן|בדוק|בחר|לחץ|הקלד|תוכל|תרצה|קבל|שים לב|דע|זכור)(?=[\s.,:;)!?"'״–-]|$)/;

/**
 * A tax amount or a saving in tax: what the בעל עסק זעיר page must never state, since it computes taxable income
 * only (no text read gives the brackets or credit points). "מהמס" as a word, not the start of "מהמסלול".
 */
export const TAX_CLAIM = /מס לתשלום|תשלמו|החיסכון במס|חיסכון של|תחסכו|חוסך לכם|חוסכת לכם|חוסכים לכם|מהמס(?![א-ת])/;
