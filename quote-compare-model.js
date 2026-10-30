// A local calculator for visitor-entered quotes, never an official price feed.
export const PRODUCTS = Object.freeze([
  Object.freeze({id:'rice', name:'Rice · চাল', grade:'medium grade', unit:'kg'}),
  Object.freeze({id:'lentil', name:'Lentils · ডাল', grade:'same grade', unit:'kg'}),
  Object.freeze({id:'oil', name:'Soybean oil · সয়াবিন তেল', grade:'same brand', unit:'litre'})
]);
export const OFFICIAL_REPORT = 'https://market.dam.gov.bd/market_daily_price_report?L=E';
const DAY = 86400000;
const BASES = Object.freeze(['retail', 'wholesale']);

export function parseDecimal(raw, maximum, decimals, allowZero = true) {
  if (typeof raw !== 'string' && typeof raw !== 'number') throw Error('Enter a plain decimal number');
  const text = String(raw).trim();
  if (!new RegExp(`^\\d{1,6}(?:\\.\\d{1,${decimals}})?$`).test(text)) throw Error(`Use at most ${decimals} decimal place(s); no signs or commas`);
  const number = Number(text);
  if (!Number.isFinite(number) || number > maximum || (!allowZero && number === 0)) throw Error('Value outside allowed range');
  return Math.round(number * 10 ** decimals);
}

export function dayNumber(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Enter an observation date for both markets');
  const day = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0,10) !== value) throw Error('Invalid observation date');
  return day / DAY;
}

export function compareEnteredQuotes(data, today) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Missing quote details');
  const now = dayNumber(today);
  const a = dayNumber(data.dateA), b = dayNumber(data.dateB);
  if (a > now || b > now) return {kind:'future', message:'Observation dates cannot be in the future.'};
  if (a !== b) return {kind:'mismatch', message:'Market observations are on different dates. Compare quotes from the same day.'};
  if (now - a > 7) return {kind:'stale', message:'These observations are more than seven days old. Recheck prices before comparing.'};
  if (!BASES.includes(data.basisA) || !BASES.includes(data.basisB)) return {kind:'basis-missing', message:'Choose retail or wholesale for both markets.'};
  if (data.basisA !== data.basisB) return {kind:'basis-mismatch', message:'One quote is retail and the other is wholesale. Use the same market basis.'};
  if (!data.lines || typeof data.lines !== 'object' || Array.isArray(data.lines)) throw Error('Missing product quotes');
  const known = new Set(PRODUCTS.map(p=>p.id));
  if (Object.keys(data.lines).some(id=>!known.has(id))) throw Error('Unknown product in quote');
  const rows=[];
  let centsA=0,centsB=0;
  for (const product of PRODUCTS) {
    const line=data.lines[product.id];
    if (!line || typeof line !== 'object' || Array.isArray(line)) throw Error(`Missing ${product.name} row`);
    const tenths=parseDecimal(line.quantity,100,1);
    if (!tenths) {
      if ((line.priceA ?? '').toString().trim() || (line.priceB ?? '').toString().trim()) throw Error(`Remove unused prices for ${product.name}`);
      continue;
    }
    if (line.comparable !== true) return {kind:'product-mismatch',message:`Confirm matching grade, unit and pack size for ${product.name} before comparing.`};
    const priceA=parseDecimal(line.priceA,100000,2,false);
    const priceB=parseDecimal(line.priceB,100000,2,false);
    const lineA=Math.round(priceA*tenths/10),lineB=Math.round(priceB*tenths/10);
    centsA+=lineA;centsB+=lineB;
    rows.push({id:product.id,name:product.name,grade:product.grade,unit:product.unit,quantity:tenths/10,totalA:lineA/100,totalB:lineB/100});
  }
  if (!rows.length) return {kind:'empty',message:'Enter at least one product quantity and both prices.'};
  return {kind:'compared',date:data.dateA,basis:data.basisA,source:'Visitor-entered, unverified prices',rows,totalA:centsA/100,totalB:centsB/100,difference:Math.abs(centsA-centsB)/100,lower:centsA===centsB?'equal':centsA<centsB?'A':'B'};
}
