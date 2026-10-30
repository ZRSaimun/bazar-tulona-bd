import {PRODUCTS,compareEnteredQuotes} from './quote-compare-model.js';
const form=document.querySelector('#quote-form');
const container=document.querySelector('#product-fields');
const result=document.querySelector('#result');
const region=document.querySelector('#result-table');
const dates=[document.querySelector('#date-a'),document.querySelector('#date-b')];
const controls=new Map();
const money=value=>`৳${value.toFixed(2)}`;
const localDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
for(const date of dates)date.max=localDay();
for(const product of PRODUCTS){
  const section=document.createElement('section');section.className='product';
  const heading=document.createElement('h3');heading.textContent=product.name;
  const detail=document.createElement('p');detail.textContent=`${product.grade} · ${product.unit} · visitor-entered retail quote`;
  const grid=document.createElement('div');grid.className='price-grid';
  const group={};
  for(const [field,title,step,value] of [['quantity',`Quantity (${product.unit})`,'0.1','0'],['priceA','Market A unit price (৳)','0.01',''],['priceB','Market B unit price (৳)','0.01','']]){
    const label=document.createElement('label');label.textContent=title;
    const input=document.createElement('input');input.type='number';input.inputMode='decimal';input.min='0';input.max=field==='quantity'?'100':'100000';input.step=step;input.value=value;input.id=`${product.id}-${field}`;
    label.htmlFor=input.id;label.append(input);grid.append(label);group[field]=input;
  }
  section.append(heading,detail,grid);container.append(section);controls.set(product.id,group);
}
function invalidate(){region.replaceChildren();region.hidden=true;result.textContent='Entries changed. Compare again to see an updated result.'}
form.addEventListener('input',invalidate);
function clear(){form.reset();for(const group of controls.values()){group.quantity.value='0';group.priceA.value='';group.priceB.value=''}region.replaceChildren();region.hidden=true;result.textContent='Cleared. Enter dates and prices to compare.';dates[0].focus()}
document.querySelector('#clear').addEventListener('click',clear);
form.addEventListener('submit',event=>{
  event.preventDefault();region.replaceChildren();region.hidden=true;
  if(!form.reportValidity()){result.textContent='Please complete the required dates and correct any invalid fields.';result.focus();return}
  const lines=Object.fromEntries([...controls].map(([id,group])=>[id,Object.fromEntries(Object.entries(group).map(([field,input])=>[field,input.value]))]));
  try{
    const comparison=compareEnteredQuotes({dateA:dates[0].value,dateB:dates[1].value,lines},localDay());
    if(comparison.kind!=='compared'){result.textContent=`No comparison: ${comparison.message} These prices are not verified.`;result.focus();return}
    result.textContent=`Visitor-entered, UNVERIFIED quotes from ${comparison.date}. Market A ${money(comparison.totalA)}; Market B ${money(comparison.totalB)}. ${comparison.lower==='equal'?'Equal entered totals':`Market ${comparison.lower} has a lower entered total by ${money(comparison.difference)}`}. Not a live price or shopping recommendation.`;
    const table=document.createElement('table');
    const caption=document.createElement('caption');caption.textContent='Entered prices only · BDT';table.append(caption);
    const head=document.createElement('thead');const headRow=document.createElement('tr');
    for(const label of ['Product and quantity','Market A','Market B']){const th=document.createElement('th');th.scope='col';th.textContent=label;headRow.append(th)}head.append(headRow);table.append(head);
    const body=document.createElement('tbody');
    for(const row of comparison.rows){const tr=document.createElement('tr');for(const value of [`${row.name} (${row.quantity} ${row.unit})`,money(row.totalA),money(row.totalB)]){const td=document.createElement('td');td.textContent=value;tr.append(td)}body.append(tr)}table.append(body);region.append(table);region.hidden=false;result.focus();
  }catch(error){result.textContent=`Cannot compare: ${error.message}. Correct the entered quantities and prices.`;result.focus()}
});
form.hidden=false;
result.textContent='Enter observation dates and your own quotes, then choose Compare.';
