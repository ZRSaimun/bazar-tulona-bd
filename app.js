import {CATALOGUE,PRICE_EVIDENCE,compareBasket} from './basket-explorer-model.js';
const fields=document.querySelector('#items'),error=document.querySelector('#error'),summary=document.querySelector('#summary'),totals=document.querySelector('#totals'),region=document.querySelector('#breakdown-region'),breakdown=document.querySelector('#breakdown');
const inputs=new Map(),money=n=>'৳'+n.toFixed(2);
for(const product of CATALOGUE){
  const row=document.createElement('div');row.className='item-line';
  const label=document.createElement('label');label.htmlFor='qty-'+product.id;label.append(document.createTextNode(product.name));
  const detail=document.createElement('small');detail.textContent=product.grade+' · '+product.unit+' · fictional retail';label.append(detail);
  const input=document.createElement('input');input.id=label.htmlFor;input.type='number';input.min='0';input.max='100';input.step='0.1';input.value='0';input.required=true;input.inputMode='decimal';
  input.setAttribute('aria-label',product.name+' quantity in '+product.unit);row.append(label,input);fields.append(row);inputs.set(product.id,input);input.addEventListener('input',render);
}
function hideComparison(message){summary.textContent=message;totals.replaceChildren();totals.hidden=true;breakdown.replaceChildren();region.hidden=true}
function render(){
  const quantities={};
  for(const [id,input] of inputs){
    const invalid=!input.validity.valid||input.value.trim()==='';
    input.setAttribute('aria-invalid',String(invalid));
    if(invalid){error.textContent='পরিমাণ ঠিক করুন · Use 0 to 100 in steps of 0.1.';hideComparison('Comparison unavailable until quantities are valid.');return}
    quantities[id]=input.value;
  }
  try{
    const result=compareBasket(quantities);
    if(result.evidence!==PRICE_EVIDENCE.kind)throw Error('Unexpected price source');
    error.textContent='';
    if(!result.hasItems){hideComparison('ঝুড়ি খালি · Add a quantity to compare fictional totals.');return}
    summary.textContent=result.winner==='tie'?'Both fictional retail totals are equal.':'Fictional retail market '+result.winner+' has a lower sample total by '+money(result.difference)+'. Not a real saving.';
    totals.replaceChildren();
    for(const [i,amount] of [result.totalA,result.totalB].entries()){
      const box=document.createElement('div');box.className='total';
      const label=document.createElement('small');label.textContent='Fictional retail market '+(i?'B':'A');
      const output=document.createElement('output');output.textContent=money(amount);box.append(label,output);totals.append(box);
    }
    totals.hidden=false;breakdown.replaceChildren();
    for(const item of result.rows.filter(row=>row.quantity>0)){
      const tr=document.createElement('tr');
      for(const value of [item.name+' · '+item.quantity+' '+item.unit,money(item.a),money(item.b)]){
        const td=document.createElement('td');td.textContent=value;tr.append(td);
      }
      breakdown.append(tr);
    }
    region.hidden=false;
  }catch(e){error.textContent='হিসাব করা যায়নি · '+e.message;hideComparison('Comparison unavailable. Correct quantities and try again.')}
}
document.querySelector('#clear').addEventListener('click',()=>{for(const input of inputs.values())input.value='0';render();inputs.values().next().value?.focus()});
render();