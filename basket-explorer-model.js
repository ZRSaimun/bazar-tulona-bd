import {items} from './model.js';

export const PRICE_EVIDENCE = Object.freeze({
  kind: 'synthetic-fixture', observedAt: null, verifiedAt: null,
  marketNames: ['Fictional market A', 'Fictional market B'],
  retailBasis: 'illustrative retail unit price',
  officialReference: 'https://market.dam.gov.bd/market_daily_price_report?L=E'
});

const GRADES = Object.freeze({
  rice: 'medium grade (sample)',
  lentil: 'same demo grade (sample)',
  oil: 'same demo brand (sample)'
});

export const CATALOGUE = Object.freeze(items.map(item => Object.freeze({
  id: item.id, name: item.name, unit: item.unit,
  grade: GRADES[item.id], basis: PRICE_EVIDENCE.retailBasis,
  prices: Object.freeze([...item.prices]), evidence: PRICE_EVIDENCE.kind
})));

export function parseQuantity(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') throw new Error('Enter a numeric quantity');
  const value = String(raw).trim();
  if (!/^(?:\d{1,3})(?:\.\d)?$/.test(value)) throw new Error('Use 0 to 100, in steps of 0.1');
  const quantity = Number(value);
  if (quantity > 100) throw new Error('Use 0 to 100, in steps of 0.1');
  return quantity;
}

export function compareBasket(quantities, catalogue = CATALOGUE) {
  if (!quantities || typeof quantities !== 'object' || Array.isArray(quantities)) throw new Error('Invalid basket');
  if (!Array.isArray(catalogue) || !catalogue.length) throw new Error('Missing catalogue');
  const seen = new Set();
  let totalA = 0, totalB = 0;
  const rows = catalogue.map(item => {
    if (!item || !item.id || seen.has(item.id) || !item.unit || !item.grade || item.basis !== PRICE_EVIDENCE.retailBasis || item.evidence !== 'synthetic-fixture' || !Array.isArray(item.prices) || item.prices.length !== 2 || item.prices.some(price => !Number.isFinite(price) || price < 0)) throw new Error('Cannot compare unverified or mismatched product data');
    seen.add(item.id);
    const quantity = parseQuantity(quantities[item.id] ?? '0');
    const a = Math.round(quantity * item.prices[0] * 100);
    const b = Math.round(quantity * item.prices[1] * 100);
    totalA += a; totalB += b;
    return {id:item.id,name:item.name,unit:item.unit,grade:item.grade,quantity,priceA:item.prices[0],priceB:item.prices[1],a:a/100,b:b/100,difference:(b-a)/100};
  });
  const unknown = Object.keys(quantities).filter(key => !seen.has(key));
  if (unknown.length) throw new Error('Unknown basket product');
  const winner = totalA === totalB ? 'tie' : totalA < totalB ? 'A' : 'B';
  return {rows,totalA:totalA/100,totalB:totalB/100,winner,difference:Math.abs(totalA-totalB)/100,hasItems:rows.some(row=>row.quantity>0),evidence:PRICE_EVIDENCE.kind};
}

export function answerBasketQuestion(question, result, language='bn') {
  const bn = language === 'bn';
  if (typeof question !== 'string' || question.length > 250 || !question.trim()) return {kind:'invalid',text:bn?'১–২৫০ অক্ষরে প্রশ্ন লিখুন।':'Enter a question of 1–250 characters.',sources:[]};
  const q = question.toLowerCase().normalize('NFKC');
  if (/ignore|system prompt|developer|password|otp|api.?key|override|bypass|উপেক্ষা|পাসওয়ার্ড|পাসওয়ার্ড|ওটিপি/.test(q)) return {kind:'abstain',text:bn?'এটি নমুনা ঝুড়ির হিসাব বুঝিয়ে দেয়; অন্য নির্দেশ বা ব্যক্তিগত তথ্য প্রক্রিয়া করে না।':'This guide explains sample basket arithmetic. It does not process instructions or personal details.',sources:[]};
  if (/live|today|current|real|actual|latest|এখন|আজ|সর্বশেষ|আসল|বর্তমান|দাম কত/.test(q)) return {kind:'abstain',text:bn?'এখানে বর্তমান বাজারদর যাচাই করা যায় না। সব দাম কাল্পনিক। সরকারি প্রতিবেদনে বাজার, তারিখ, পণ্যের মান ও খুচরা/পাইকারি ধরন মিলিয়ে দেখুন।':'Current prices cannot be verified here. All prices are fictional. Check market, date, grade and retail/wholesale basis in the official report.',sources:[PRICE_EVIDENCE.officialReference]};
  if (/unit|grade|quality|same|compare fair|কেজি|লিটার|মান|একই|তুলনা/.test(q)) return {kind:'supported',text:bn?'দুই নমুনা বাজারে প্রতিটি পণ্যের পরিমাণ, একক ও নমুনা মান একই রাখা হয়েছে। চাল/ডাল কেজিতে এবং তেল লিটারে; ভিন্ন একক যোগ করে একক দাম তুলনা করবেন না।':'Each product uses the same sample quantity, unit and grade in both fictional markets. Rice and lentils use kg; oil uses litres. Do not compare unit prices across different units.',sources:[]};
  if (/source|proof|where|official|উৎস|সরকারি|প্রমাণ/.test(q)) return {kind:'supported',text:bn?'এই দামের কোনো পর্যবেক্ষণ বা যাচাইয়ের তারিখ নেই; এগুলো কেবল উদাহরণ। প্রকৃত বাজারদরের জন্য কৃষি বিপণন অধিদপ্তরের প্রতিবেদন খুলুন।':'These figures have no observation or verification date: they are examples only. Open the Department of Agricultural Marketing report for actual market information.',sources:[PRICE_EVIDENCE.officialReference]};
  if (/cheaper|save|saving|difference|total|which|কোন|কম|সাশ্রয়|পার্থক্য|মোট/.test(q)) {
    if (!result?.hasItems) return {kind:'clarify',text:bn?'আগে অন্তত একটি পণ্যের পরিমাণ দিন। তারপর দুই নমুনা বাজারের মোট তুলনা করা যাবে।':'Enter a quantity for at least one product first, then compare the two fictional totals.',sources:[]};
    const label = result.winner === 'tie' ? (bn?'সমান':'equal') : `Market ${result.winner}`;
    return {kind:'supported',text:bn?`এই কাল্পনিক ঝুড়িতে A: ৳${result.totalA.toFixed(2)}, B: ৳${result.totalB.toFixed(2)}। ${label}। পার্থক্য ৳${result.difference.toFixed(2)}। এটি বাস্তব সাশ্রয়ের পূর্বাভাস নয়।`:`In this fictional basket: A ৳${result.totalA.toFixed(2)}, B ৳${result.totalB.toFixed(2)}. ${label} total; difference ৳${result.difference.toFixed(2)}. This does not predict real savings.`,sources:[]};
  }
  return {kind:'abstain',text:bn?'এই প্রশ্নের যাচাই করা উত্তর এখানে নেই। নমুনা ঝুড়ির মোট, একক বা উৎস সম্পর্কে জিজ্ঞেস করুন।':'There is no verified answer to that here. Ask about sample totals, units or sources.',sources:[]};
}
