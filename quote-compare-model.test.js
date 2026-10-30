import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,OFFICIAL_REPORT,compareEnteredQuotes,dayNumber,parseDecimal} from './quote-compare-model.js';
const today='2026-10-30';
const example=()=>({dateA:'2026-10-29',dateB:'2026-10-29',basisA:'retail',basisB:'retail',lines:{rice:{quantity:'2',priceA:'60',priceB:'62',comparable:true},lentil:{quantity:'1',priceA:'120',priceB:'115',comparable:true},oil:{quantity:'0.5',priceA:'165',priceB:'168',comparable:true}}});
test('three identical product definitions have units and grade',()=>{assert.deepEqual(PRODUCTS.map(p=>p.id),['rice','lentil','oil']);assert.equal(PRODUCTS[2].unit,'litre');assert.ok(PRODUCTS.every(p=>p.grade));});
test('computes visitor-entered basket, never demo fixture',()=>{const r=compareEnteredQuotes(example(),today);assert.equal(r.kind,'compared');assert.equal(r.totalA,322.5);assert.equal(r.totalB,323);assert.equal(r.lower,'A');assert.equal(r.difference,.5);assert.equal(r.source,'Visitor-entered, unverified prices');});
test('partial decimal prices round each line in integer poisha',()=>{const x=example();x.lines.rice={quantity:'0.3',priceA:'1.01',priceB:'1.02',comparable:true};x.lines.lentil={quantity:'0',priceA:'',priceB:''};x.lines.oil={quantity:'0',priceA:'',priceB:''};const r=compareEnteredQuotes(x,today);assert.equal(r.totalA,.3);assert.equal(r.totalB,.31);});
test('missing market date fails closed',()=>assert.throws(()=>compareEnteredQuotes({...example(),dateB:''},today)));
test('invalid and impossible dates fail closed',()=>{for(const date of ['2026-02-30','2026-13-01','29/10/2026','2026-2-9',''])assert.throws(()=>dayNumber(date));});
test('leap day accepted',()=>assert.equal(dayNumber('2024-02-29'),Date.parse('2024-02-29T00:00:00Z')/86400000));
test('different market dates refuse comparison',()=>assert.equal(compareEnteredQuotes({...example(),dateB:'2026-10-28'},today).kind,'mismatch'));
test('future quote dates refuse comparison',()=>assert.equal(compareEnteredQuotes({...example(),dateA:'2026-11-01',dateB:'2026-11-01'},today).kind,'future'));
test('older than seven days refuses comparison',()=>assert.equal(compareEnteredQuotes({...example(),dateA:'2026-10-22',dateB:'2026-10-22'},today).kind,'stale'));
test('seven day boundary accepted',()=>assert.equal(compareEnteredQuotes({...example(),dateA:'2026-10-23',dateB:'2026-10-23'},today).kind,'compared'));
test('empty basket has no winner',()=>{const x=example();for(const v of Object.values(x.lines))Object.assign(v,{quantity:'0',priceA:'',priceB:''});assert.equal(compareEnteredQuotes(x,today).kind,'empty');});
test('missing quote on selected product rejects',()=>{const x=example();x.lines.rice.priceB='';assert.throws(()=>compareEnteredQuotes(x,today));});
test('unused quote prices reject instead of hiding data',()=>{const x=example();x.lines.rice.quantity='0';assert.throws(()=>compareEnteredQuotes(x,today));});
test('unexpected product and missing rows reject',()=>{const x=example();x.lines.extra={quantity:'1'};assert.throws(()=>compareEnteredQuotes(x,today));delete x.lines.extra;delete x.lines.oil;assert.throws(()=>compareEnteredQuotes(x,today));});
test('negative, exponent, commas, infinity, excess precision and huge numbers reject',()=>{for(const raw of ['-1','1e3','1,000','Infinity','NaN','1.001','100001','',null,undefined])assert.throws(()=>parseDecimal(raw,100000,2));});
test('zero or missing selected price rejected',()=>{const x=example();x.lines.rice.priceA='0';assert.throws(()=>compareEnteredQuotes(x,today));});
test('quantity limits and decimal step enforced',()=>{const x=example();for(const v of ['100.1','0.12','-1','1e2']){x.lines.rice.quantity=v;assert.throws(()=>compareEnteredQuotes(x,today));}x.lines.rice.quantity='100';assert.equal(compareEnteredQuotes(x,today).kind,'compared');});
test('official URL is only a navigation link, not price evidence',()=>{assert.equal(new URL(OFFICIAL_REPORT).hostname,'market.dam.gov.bd');assert.equal(compareEnteredQuotes(example(),today).source,'Visitor-entered, unverified prices');});


test('retail and wholesale quotes cannot be mixed',()=>{
  const x=example();x.basisB='wholesale';
  const r=compareEnteredQuotes(x,today);
  assert.equal(r.kind,'basis-mismatch');assert.equal('lower' in r,false);
});
test('missing, unknown or falsified basis refuses a winner',()=>{
  for(const value of ['',undefined,'other','Retail']){
    const x=example();x.basisA=value;
    assert.equal(compareEnteredQuotes(x,today).kind,'basis-missing');
  }
});
test('matching wholesale quotes are labelled as wholesale and remain unverified',()=>{
  const x=example();x.basisA=x.basisB='wholesale';
  const r=compareEnteredQuotes(x,today);
  assert.equal(r.kind,'compared');assert.equal(r.basis,'wholesale');
  assert.equal(r.source,'Visitor-entered, unverified prices');
});
test('selected product requires explicit matching grade, unit and pack confirmation',()=>{
  for(const value of [false,undefined,'true',1]){
    const x=example();x.lines.rice.comparable=value;
    const r=compareEnteredQuotes(x,today);
    assert.equal(r.kind,'product-mismatch');assert.equal('lower' in r,false);
  }
});
test('unused product does not require confirmation',()=>{
  const x=example();x.lines.oil={quantity:'0',priceA:'',priceB:'',comparable:false};
  const r=compareEnteredQuotes(x,today);
  assert.equal(r.kind,'compared');assert.equal(r.rows.length,2);
});
test('future and stale dates still refuse a winner before basis checks',()=>{
  const x=example();x.basisA='';
  x.dateA=x.dateB='2026-10-20';
  assert.equal(compareEnteredQuotes(x,today).kind,'stale');
  x.dateA=x.dateB='2026-11-01';
  assert.equal(compareEnteredQuotes(x,today).kind,'future');
});
test('interface includes required basis selectors and a public correction route',async()=>{
  const {readFileSync}=await import('node:fs');
  const html=readFileSync(new URL('./quote-compare.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./quote-compare.js',import.meta.url),'utf8');
  assert.match(html,/id="basis-a" required/);
  assert.match(html,/id="basis-b" required/);
  assert.match(html,/issues\/new/);
  assert.match(html,/Do not post names, phone numbers/);
  assert.match(js,/match\.type='checkbox'/);
  assert.match(js,/field==='comparable'\?input\.checked:input\.value/);
});
