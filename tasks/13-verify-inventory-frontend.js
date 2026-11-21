const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element {
 constructor(){this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.dataset={};this.children=[];this.isConnected=true;this.handlers={};}
 append(...items){this.children.push(...items);}
 replaceChildren(){this.children=[];}
 setAttribute(){}
 addEventListener(name,handler){this.handlers[name]=handler;}
 focus(){}
 reset(){for(const [id,item] of Object.entries(elements))if(id.startsWith('inventory_'))item.value='';}
}
const elements={};for(const match of fs.readFileSync('frontend/pages/inventory.html','utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]=new Element();
const context=vm.createContext({document:{getElementById:id=>elements[id],createElement:()=>new Element()},apiRequest:async()=>[],formatPeso:n=>'PHP '+n.toFixed(2),setStatus:(e,m,s='')=>{e.textContent=m;e.dataset.state=s;},setButtonBusy:(e,b)=>{e.disabled=b;}});
vm.runInContext(fs.readFileSync('frontend/src/js/inventory.js','utf8'),context);const run=s=>vm.runInContext(s,context);
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(elements.inventoryListStatus.textContent,/No items/);
 let payload=run('readInventoryForm()');assert.equal(payload.quantity,0);assert.equal(payload.reorder_level,5);assert.equal(payload.cost,null);assert.equal(payload.selling_price,null);
 elements.inventory_cost.value='0';elements.inventory_selling_price.value='25.75';elements.inventory_reorder_level.value='0';elements.inventory_brand.value=' Alpha ';
 payload=run('readInventoryForm()');assert.equal(payload.cost,0);assert.equal(payload.selling_price,25.75);assert.equal(payload.reorder_level,0);assert.equal(payload.brand,'Alpha');
 elements.inventory_quantity.value='1.5';assert.throws(()=>run('readInventoryForm()'),/whole/);elements.inventory_quantity.value='';
 assert.equal(run('isLowStock({quantity:5,reorder_level:5})'),true);assert.equal(run('isLowStock({quantity:null,reorder_level:5})'),false);assert.equal(run('isLowStock({quantity:0,reorder_level:null})'),false);
 context.event={preventDefault(){}};context.item={item_code:'ITM A?#',quantity:0,reorder_level:5};run('showRestock(item,null)');
 let calls=0,finish,request;
 context.apiRequest=(path,options)=>{calls++;request={path,options};return new Promise(resolve=>{finish=resolve;});};
 for(const value of ['0','-1','1.5','']){elements.restockQuantity.value=value;await run('saveRestock(event)');assert.equal(calls,0);assert.match(elements.restockStatus.textContent,/positive whole/);}
 elements.restockQuantity.value='2';const pending=run('saveRestock(event)');
 assert.equal(elements.saveRestockButton.disabled,true);assert.equal(elements.restockQuantity.disabled,true);assert.equal(elements.cancelRestockButton.disabled,true);
 await run('saveRestock(event)');assert.equal(calls,1);assert.equal(request.path,'/inventory/ITM%20A%3F%23?quantity=2');assert.equal(request.options.method,'PUT');assert.equal(request.options.body,undefined);
 context.apiRequest=async()=>[];finish({item_code:'ITM A?#',new_quantity:2});await pending;assert.equal(elements.saveRestockButton.disabled,false);assert.match(elements.inventoryFeedback.textContent,/New quantity: 2/);
 run('showRestock(item,null)');elements.restockQuantity.value='3';context.apiRequest=async()=>({error:'Not found'});await run('saveRestock(event)');assert.match(elements.restockStatus.textContent,/Not found/);assert.equal(elements.restockQuantity.value,'3');assert.equal(elements.cancelRestockButton.disabled,false);
 run('closeRestock()');assert.equal(elements.restockSection.hidden,true);
 let finishAdd,addCalls=0;context.apiSend=()=>{addCalls++;return new Promise(resolve=>{finishAdd=resolve;});};const add=run('saveInventory(event)');await run('saveInventory(event)');assert.equal(addCalls,1);assert.equal(elements.inventoryFormFields.disabled,true);context.apiRequest=async()=>[];finishAdd({item_code:'ITM-SYN'});await add;assert.equal(elements.inventoryFormFields.disabled,false);
 elements.inventory_brand.value='Retained';context.apiSend=async()=>{throw new Error('Synthetic failure');};await run('saveInventory(event)');assert.equal(elements.inventory_brand.value,'Retained');assert.match(elements.inventorySaveStatus.textContent,/Synthetic failure/);assert.equal(elements.saveInventoryButton.disabled,false);
 context.apiRequest=async()=>{throw new Error('Synthetic list error');};await run('loadInventory()');run('renderInventory()');assert.match(elements.inventoryListStatus.textContent,/Synthetic list error/);
 console.log('PASS: defaults/zero/null prices, integer validation, equality/null stock rules, encoded query PUT without body, duplicate guards, legacy missing-item failure, retained errors, cancel/finally recovery.');
})().catch(e=>{console.error(e);process.exitCode=1;});
