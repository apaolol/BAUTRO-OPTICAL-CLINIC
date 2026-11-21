const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element {
 constructor(){this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.dataset={};this.children=[];this.isConnected=true;}
 append(...items){this.children.push(...items);}
 replaceChildren(){this.children=[];}
 setAttribute(){}
 addEventListener(){}
 focus(){}
 reset(){for(const [id,item] of Object.entries(elements))if(id.startsWith('prescription_'))item.value='';}
}
const elements={};
for(const match of fs.readFileSync('frontend/pages/prescriptions.html','utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]=new Element();
let printCalls=0;
const context=vm.createContext({document:{getElementById:id=>elements[id],createElement:()=>new Element()},window:{print:()=>{printCalls++;}},apiRequest:async()=>[],setStatus:(element,message,state='')=>{element.textContent=message;element.dataset.state=state;},setButtonBusy:(button,busy)=>{button.disabled=busy;}});
vm.runInContext(fs.readFileSync('frontend/src/js/prescriptions.js','utf8'),context);
const run=source=>vm.runInContext(source,context);
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(elements.prescriptionListStatus.textContent,/No prescriptions on record/);
 const fields=run('prescriptionFields.map(([key])=>key).filter(key=>!["prescription_number","date"].includes(key))');
 assert.equal(fields.length,17);
 for(const key of fields)elements['prescription_'+key].value=' Synthetic '+key+' ';
 elements.prescription_od_sphere.value=' -1.25 ';elements.prescription_od_axis.value='005';elements.prescription_os_sphere.value='+2.25';elements.prescription_os_axis.value='090';
 let payload=run('readPrescriptionForm()');
 assert.equal(payload.od_sphere,'-1.25');assert.equal(payload.od_axis,'005');assert.equal(payload.os_sphere,'+2.25');assert.equal(payload.os_axis,'090');
 for(const key of fields)assert.equal(typeof payload[key],'string');
 for(const key of fields)elements['prescription_'+key].value='  ';
 assert.throws(()=>run('readPrescriptionForm()'),/Patient number is required/);
 elements.prescription_patient_number.value=' P-SYN-MIN ';
 payload=run('readPrescriptionForm()');assert.equal(payload.patient_number,'P-SYN-MIN');
 for(const key of fields.filter(key=>key!=='patient_number'))assert.equal(payload[key],null);
 let finish,calls=0;context.apiSend=()=>{calls++;return new Promise(resolve=>{finish=resolve;});};context.event={preventDefault(){}};
 const saving=run('savePrescription(event)');
 assert.equal(elements.savePrescriptionButton.disabled,true);assert.equal(elements.prescriptionFormFields.disabled,true);assert.equal(elements.cancelPrescriptionButton.disabled,true);
 await run('savePrescription(event)');assert.equal(calls,1);
 finish({prescription_number:'RX-SYN'});await saving;
 assert.equal(elements.savePrescriptionButton.disabled,false);assert.equal(elements.prescriptionFormFields.disabled,false);assert.match(elements.prescriptionFeedback.textContent,/RX-SYN/);
 elements.prescription_patient_number.value='P-SYN-RETAIN';context.apiSend=async()=>{throw new Error('Synthetic 422');};
 await run('savePrescription(event)');assert.equal(elements.prescription_patient_number.value,'P-SYN-RETAIN');assert.match(elements.prescriptionSaveStatus.textContent,/Synthetic 422/);assert.equal(elements.savePrescriptionButton.disabled,false);
 context.apiRequest=async()=>{throw new Error('Synthetic list failure');};await run('loadPrescriptions()');run('renderPrescriptions()');assert.match(elements.prescriptionListStatus.textContent,/Synthetic list failure/);
 elements.prescriptionDetailsSection.hidden=true;run('printPrescription()');assert.equal(printCalls,0);
 context.selected={prescription_number:'RX-SELECTED',patient_number:'P-SYN',od_axis:'005',os_axis:'090',lens_brand:'Synthetic brand',lens_coating:'Synthetic coating',notes:'<b>literal</b>'};
 run('showPrescriptionDetails(selected, null)');assert.equal(elements.prescriptionDetails.children.length,19);
 assert.equal(elements.prescriptionDetails.children[18].children[1].textContent,'<b>literal</b>');run('printPrescription()');assert.equal(printCalls,1);
 context.apiRequest=async()=>[{prescription_number:null,patient_number:null}];await run('loadPrescriptions()');assert.equal(elements.prescriptionTableBody.children.length,1);
 console.log('PASS: 17 inputs, string optical values/leading zeros/nulls, required validation, duplicate guard, disable/finally recovery, retained entries, load errors, 19 safe detail fields and selected-only print invocation.');
})().catch(error=>{console.error(error);process.exitCode=1;});
