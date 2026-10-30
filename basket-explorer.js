import {CATALOGUE,PRICE_EVIDENCE,compareBasket,answerBasketQuestion} from './basket-explorer-model.js';
const fields=document.querySelector('#basket-fields');
const inputs={};
for(const item of CATALOGUE){
  const row=document.createElement('div');row.className='item-row';
  const label=document.createElement('label');label.htmlFor=`quantity-${item.id}`;
  const name=document.createElement('strong');name.textContent=item.name;
  const detail=document.createElement('small');detail.textContent=`${item.grade} · ${item.unit} · fictional retail`;
  label.append(name,detail);
  const input=document.createElement('input');input.id=label.htmlFor;input.type='number';input.min='0';input.max='100';input.step='0.1';input.value='0';input.inputMode='decimal';input.setAttribute('aria-label',`${item.name} quantity in ${item.unit}`);
  row.append(label,input);fields.append(row);inputs[item.id]=input;
}
const money=value=>`৳${value.toFixed(2)}`;
let latest=null;
function render(){
  try{
    const quantities=Object.fromEntries(Object.entries(inputs).map(([id,input])=>[id,input.value]));
    latest=compareBasket(quantities);
    document.querySelector('#form-error').textContent='';
    const summary=document.querySelector('#summary');
    summary.textContent=latest.hasItems?`Fictional A: ${money(latest.totalA)} · Fictional B: ${money(latest.totalB)}. ${latest.winner==='tie'?'Equal sample totals':`Sample market ${latest.winner} is lower by ${money(latest.difference)}`}. Not a real quote.`:'Add quantities to compare fictional totals.';
    const breakdown=document.querySelector('#breakdown');breakdown.replaceChildren();
    for(const row of latest.rows){
      const tr=document.createElement('tr');
      for(const value of [`${row.name} (${row.quantity} ${row.unit})`,money(row.a),money(row.b),`${row.difference>0?'+':''}${money(row.difference)}`]){const td=document.createElement('td');td.textContent=value;tr.append(td)}
      breakdown.append(tr);
    }
    const bars=document.querySelector('#bars');bars.replaceChildren();bars.className='bars';
    const max=Math.max(latest.totalA,latest.totalB,1);
    for(const [i,total] of [latest.totalA,latest.totalB].entries()){
      const label=document.createElement('div');label.className='bar-label';label.textContent=`${PRICE_EVIDENCE.marketNames[i]} · ${money(total)}`;
      const track=document.createElement('div');track.className='bar-track';const fill=document.createElement('div');fill.className=`bar-fill${i?' alt':''}`;fill.style.width=`${100*total/max}%`;track.append(fill);bars.append(label,track);
    }
  }catch(error){latest=null;document.querySelector('#form-error').textContent=error.message;document.querySelector('#summary').textContent='Calculation unavailable. Correct the quantity above.';document.querySelector('#breakdown').replaceChildren();document.querySelector('#bars').replaceChildren();}
}
for(const input of Object.values(inputs))input.addEventListener('input',render);
document.querySelector('#reset').addEventListener('click',()=>{for(const input of Object.values(inputs))input.value='0';render();Object.values(inputs)[0].focus()});
const answer=document.querySelector('#answer');
function explain(question){const response=answerBasketQuestion(question,latest,document.querySelector('#language').value);answer.replaceChildren(document.createTextNode(response.text));for(const url of response.sources){if(url!==PRICE_EVIDENCE.officialReference)continue;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Department of Agricultural Marketing (official external link)';answer.append(document.createElement('br'),a)}answer.focus()}
document.querySelector('#question-form').addEventListener('submit',event=>{event.preventDefault();explain(document.querySelector('#question').value)});
for(const button of document.querySelectorAll('[data-example]'))button.addEventListener('click',()=>{document.querySelector('#question').value=button.dataset.example;explain(button.dataset.example)});
document.querySelector('#clear-answer').addEventListener('click',()=>{answer.textContent='Answer cleared. Questions are not stored or sent.';document.querySelector('#question').value='';document.querySelector('#question').focus()});
render();
