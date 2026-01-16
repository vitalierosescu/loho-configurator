import { getConfig } from './config.js';
import { createState, updateSelection, updateFormData, setStep, getSubmissionData } from './state.js';
import { validateStep, validateForm } from './validation.js';
import { submit } from './api.js';
import {
  cacheElements, showStep, updateNavButtons, updateProgress, updatePreviewImage,
  highlightSelection, showValidationError, setSubmitLoading, showThankYou, highlightDateChip
} from './ui.js';

class LOHOConfigurator {
  constructor(userConfig = {}) {
    window.LOHO_CONFIG = userConfig;
    this.config = getConfig();
    this.state = createState();
    this.elements = null;
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.handleFormInput = this.handleFormInput.bind(this);
    this.handleDateChipClick = this.handleDateChipClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.previousStep = this.previousStep.bind(this);
  }

  init() {
    console.log('LOHO Configurator initializing...');
    this.elements = cacheElements();
    this.setupEventListeners();
    this.goToStep(1);
    console.log('LOHO Configurator ready!');
    return this;
  }

  setupEventListeners() {
    document.addEventListener('click', this.handleOptionClick);
    if (this.elements.btnNext) this.elements.btnNext.addEventListener('click', this.nextStep);
    if (this.elements.btnPrevious) this.elements.btnPrevious.addEventListener('click', this.previousStep);
    if (this.elements.btnSubmit) this.elements.btnSubmit.addEventListener('click', this.handleSubmit);
    if (this.elements.form) {
      this.elements.form.addEventListener('input', this.handleFormInput);
      this.elements.form.addEventListener('submit', this.handleSubmit);
    }
    document.addEventListener('click', this.handleDateChipClick);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.state.currentStep < this.state.totalSteps) this.nextStep();
    });
  }

  handleOptionClick(e) {
    const card = e.target.closest('[data-option]');
    if (!card) return;
    const optionType = card.dataset.option;
    const value = card.dataset.value;
    updateSelection(this.state, optionType, value);
    highlightSelection(card, optionType);
    if (optionType === 'color' && card.dataset.image) {
      updatePreviewImage(card.dataset.image, this.elements, this.config);
    }
    if (this.config.callbacks.onSelectionChange) {
      this.config.callbacks.onSelectionChange(optionType, value, this.state);
    }
  }

  handleFormInput(e) {
    const { name, value } = e.target;
    if (name && this.state.formData.hasOwnProperty(name)) {
      updateFormData(this.state, name, value);
    }
  }

  handleDateChipClick(e) {
    const chip = e.target.closest('.date-chip');
    if (!chip) return;
    highlightDateChip(chip);
    const radio = chip.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      updateFormData(this.state, 'installation', radio.value);
    }
  }

  goToStep(stepNumber) {
    showStep(stepNumber, this.elements, this.config);
    updateNavButtons(stepNumber, this.state.totalSteps, this.elements);
    updateProgress(stepNumber, this.state.totalSteps, this.elements, this.config);
    setStep(this.state, stepNumber);
    if (this.config.callbacks.onStepChange) {
      this.config.callbacks.onStepChange(stepNumber, this.state);
    }
  }

  nextStep() {
    if (!validateStep(this.state.currentStep, this.state)) {
      showValidationError(this.state.currentStep, this.config);
      return;
    }
    if (this.state.currentStep < this.state.totalSteps) {
      this.goToStep(this.state.currentStep + 1);
    }
  }

  previousStep() {
    if (this.state.currentStep > 1) this.goToStep(this.state.currentStep - 1);
  }

  async handleSubmit(e) {
    if (e) e.preventDefault();
    const formInputs = this.elements.form?.querySelectorAll('input');
    formInputs?.forEach(input => {
      if (input.name && input.type !== 'radio') updateFormData(this.state, input.name, input.value);
      if (input.type === 'radio' && input.checked) updateFormData(this.state, input.name, input.value);
    });
    if (!validateForm(this.state)) {
      showValidationError(this.state.currentStep, this.config);
      return;
    }
    const data = getSubmissionData(this.state);
    if (this.config.callbacks.onSubmitStart) this.config.callbacks.onSubmitStart(data);
    setSubmitLoading(true, this.elements, this.config);
    try {
      const response = await submit(data, this.config);
      if (this.config.callbacks.onSubmitSuccess) this.config.callbacks.onSubmitSuccess(response, data);
      showThankYou(this.elements);
    } catch (error) {
      console.error('Submission error:', error);
      if (this.config.callbacks.onSubmitError) this.config.callbacks.onSubmitError(error, data);
      alert('There was an error submitting your request. Please try again.');
      setSubmitLoading(false, this.elements, this.config);
    }
  }

  getState() { return this.state; }
  getSelections() { return this.state.selections; }
  setPreviewImage(url) { updatePreviewImage(url, this.elements, this.config); }
}

function autoInit() {
  const container = document.querySelector('[data-loho-configurator]');
  if (container) {
    const configAttr = container.dataset.lohoConfig;
    const config = configAttr ? JSON.parse(configAttr) : {};
    window.lohoConfigurator = new LOHOConfigurator(config).init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

export { LOHOConfigurator };
window.LOHOConfigurator = LOHOConfigurator;