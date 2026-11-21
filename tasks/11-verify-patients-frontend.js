const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
 constructor() { this.value=''; this.textContent=''; this.hidden=false; this.disabled=false; this.dataset={}; this.children=[]; this.isConnected=true; }
 append(...items) { this.children.push(...items); }
 replaceChildren() { this.children=[]; }
 setAttribute() {}
 addEventListener() {}
 focus() {}
 reset() { for (const [id,item] of Object.entries(elements)) if(id.startsWith('patient_')) item.value=''; }
}
const elements = {};
for (const match of fs.readFileSync('frontend/pages/patients.html','utf8').matchAll(/id="([^"]+)"/g)) elements[match[1]]=new Element();
const context = vm.createContext({document:{getElementById:id=>elements[id],createElement:()=>new Element()},apiRequest:async()=>[],setStatus:(element,message,state='')=>{element.textContent=message;element.dataset.state=state;},setButtonBusy:(button,busy)=>{button.disabled=busy;}});
vm.runInContext(fs.readFileSync('frontend/src/js/patients.js','utf8'),context);
const run = source => vm.runInContext(source,context);
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(elements.patientListStatus.textContent,/No patients registered/);
 const fields=run('patientFields.map(([key])=>key).filter(key=>!["patient_number","date_created"].includes(key))');
 assert.equal(fields.length,21);
 for(const key of fields) elements['patient_'+key].value=' Synthetic '+key+' ';
 elements.patient_age.value='0';
 let payload=run('readPatientForm()');
 assert.equal(payload.age,0);
 for(const key of fields.filter(key=>key!=='age')) assert.equal(payload[key],'Synthetic '+key);
 for(const key of fields) elements['patient_'+key].value='  ';
 assert.throws(()=>run('readPatientForm()'),/required/);
 elements.patient_full_name.value=' Synthetic Minimal ';
 elements.patient_contact_number.value=' 0000 ';
 payload=run('readPatientForm()');
 assert.equal(payload.full_name,'Synthetic Minimal');
 assert.equal(payload.contact_number,'0000');
 for(const key of fields.filter(key=>!['full_name','contact_number'].includes(key))) assert.equal(payload[key],null);
 elements.patient_age.value='1.5';assert.throws(()=>run('readPatientForm()'),/whole number/);elements.patient_age.value='';
 let finish;
 let calls=0;
 context.apiSend=()=>{calls++;return new Promise(resolve=>{finish=resolve;});};
 context.event={preventDefault(){}};
 const saving=run('savePatient(event)');
 assert.equal(elements.savePatientButton.disabled,true);
 assert.equal(elements.cancelPatientButton.disabled,true);
 assert.equal(elements.patientFormFields.disabled,true);
 await run('savePatient(event)');
 assert.equal(calls,1);
 finish({patient_number:'P-SYNTHETIC'});await saving;
 assert.equal(elements.savePatientButton.disabled,false);
 assert.equal(elements.patientFormFields.disabled,false);
 assert.match(elements.patientFeedback.textContent,/P-SYNTHETIC/);
 elements.patient_full_name.value='Retained synthetic';elements.patient_contact_number.value='000';
 context.apiSend=async()=>{throw new Error('Synthetic validation failure');};
 await run('savePatient(event)');
 assert.equal(elements.patient_full_name.value,'Retained synthetic');
 assert.equal(elements.savePatientButton.disabled,false);
 assert.match(elements.patientSaveStatus.textContent,/Synthetic validation failure/);
 context.apiRequest=async()=>{throw new Error('Synthetic list failure');};
 await run('loadPatients()');run('renderPatients()');assert.match(elements.patientListStatus.textContent,/Synthetic list failure/);
 context.apiRequest=async()=>[{patient_number:'P-SYN',full_name:null,contact_number:null,age:0}];
 await run('loadPatients()');assert.equal(elements.patientTableBody.children.length,1);
 assert.equal(elements.patientTableBody.children[0].children[2].textContent,'0');
 console.log('PASS: all 21 fields, trimming/nulls/age zero, required/age validation, pending duplicate guard, disable/finally recovery, retained entries and list errors, nullable records.');
})().catch(error=>{console.error(error);process.exitCode=1;});
