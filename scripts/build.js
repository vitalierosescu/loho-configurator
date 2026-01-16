const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const files = ['config.js', 'state.js', 'validation.js', 'api.js', 'ui.js'].map(f => 
  fs.readFileSync(path.join(srcDir, f), 'utf8')
);
const stylesCSS = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');

function clean(code) {
  return code.replace(/^import.*from.*['"].*['"];?\s*$/gm, '').replace(/^export\s+(default\s+)?/gm, '').replace(/^export\s*\{[^}]*\};?\s*$/gm, '');
}

const bundled = `(function(global){'use strict';
${files.map(clean).join('\n')}
class LOHOConfigurator{constructor(c={}){window.LOHO_CONFIG=c;this.config=getConfig();this.state=createState();this.elements=null;this.handleOptionClick=this.handleOptionClick.bind(this);this.handleFormInput=this.handleFormInput.bind(this);this.handleDateChipClick=this.handleDateChipClick.bind(this);this.handleSubmit=this.handleSubmit.bind(this);this.nextStep=this.nextStep.bind(this);this.previousStep=this.previousStep.bind(this)}init(){this.elements=cacheElements();this.setupEventListeners();this.goToStep(1);return this}setupEventListeners(){document.addEventListener('click',this.handleOptionClick);if(this.elements.btnNext)this.elements.btnNext.addEventListener('click',this.nextStep);if(this.elements.btnPrevious)this.elements.btnPrevious.addEventListener('click',this.previousStep);if(this.elements.btnSubmit)this.elements.btnSubmit.addEventListener('click',this.handleSubmit);if(this.elements.form){this.elements.form.addEventListener('input',this.handleFormInput);this.elements.form.addEventListener('submit',this.handleSubmit)}document.addEventListener('click',this.handleDateChipClick)}handleOptionClick(e){const card=e.target.closest('[data-option]');if(!card)return;const t=card.dataset.option,v=card.dataset.value;updateSelection(this.state,t,v);highlightSelection(card,t);if(t==='color'&&card.dataset.image)updatePreviewImage(card.dataset.image,this.elements,this.config);if(this.config.callbacks.onSelectionChange)this.config.callbacks.onSelectionChange(t,v,this.state)}handleFormInput(e){const{name,value}=e.target;if(name&&this.state.formData.hasOwnProperty(name))updateFormData(this.state,name,value)}handleDateChipClick(e){const chip=e.target.closest('.date-chip');if(!chip)return;highlightDateChip(chip);const r=chip.querySelector('input[type="radio"]');if(r){r.checked=true;updateFormData(this.state,'installation',r.value)}}goToStep(n){showStep(n,this.elements,this.config);updateNavButtons(n,this.state.totalSteps,this.elements);updateProgress(n,this.state.totalSteps,this.elements,this.config);setStep(this.state,n);if(this.config.callbacks.onStepChange)this.config.callbacks.onStepChange(n,this.state)}nextStep(){if(!validateStep(this.state.currentStep,this.state)){showValidationError(this.state.currentStep,this.config);return}if(this.state.currentStep<this.state.totalSteps)this.goToStep(this.state.currentStep+1)}previousStep(){if(this.state.currentStep>1)this.goToStep(this.state.currentStep-1)}async handleSubmit(e){if(e)e.preventDefault();const inputs=this.elements.form?.querySelectorAll('input');inputs?.forEach(i=>{if(i.name&&i.type!=='radio')updateFormData(this.state,i.name,i.value);if(i.type==='radio'&&i.checked)updateFormData(this.state,i.name,i.value)});if(!validateForm(this.state)){showValidationError(this.state.currentStep,this.config);return}const data=getSubmissionData(this.state);if(this.config.callbacks.onSubmitStart)this.config.callbacks.onSubmitStart(data);setSubmitLoading(true,this.elements,this.config);try{const r=await submit(data,this.config);if(this.config.callbacks.onSubmitSuccess)this.config.callbacks.onSubmitSuccess(r,data);showThankYou(this.elements)}catch(err){console.error(err);if(this.config.callbacks.onSubmitError)this.config.callbacks.onSubmitError(err,data);alert('Error submitting. Please try again.');setSubmitLoading(false,this.elements,this.config)}}getState(){return this.state}getSelections(){return this.state.selections}}
function autoInit(){const c=document.querySelector('[data-loho-configurator]');if(c){const cfg=c.dataset.lohoConfig?JSON.parse(c.dataset.lohoConfig):{};global.lohoConfigurator=new LOHOConfigurator(cfg).init()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',autoInit);else autoInit();
global.LOHOConfigurator=LOHOConfigurator;})(window);`;

fs.writeFileSync(path.join(distDir, 'configurator.js'), bundled);
fs.writeFileSync(path.join(distDir, 'configurator.min.js'), bundled.replace(/\s+/g,' ').trim());
fs.writeFileSync(path.join(distDir, 'configurator.css'), stylesCSS);
fs.writeFileSync(path.join(distDir, 'configurator.min.css'), stylesCSS.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim());

console.log('✓ Built dist/configurator.js\n✓ Built dist/configurator.min.js\n✓ Built dist/configurator.css\n✓ Built dist/configurator.min.css');