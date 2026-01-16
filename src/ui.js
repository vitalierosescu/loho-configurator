export function cacheElements() {
  return {
    steps: document.querySelectorAll('[data-step]'),
    options: document.querySelectorAll('[data-option]'),
    preview: document.querySelector('[data-preview]'),
    progress: document.querySelector('[data-progress]'),
    btnNext: document.querySelector('[data-nav="next"]'),
    btnPrevious: document.querySelector('[data-nav="previous"]'),
    btnSubmit: document.querySelector('[data-nav="submit"]'),
    form: document.getElementById('configurator-form'),
    thankYou: document.querySelector('[data-thank-you]'),
    wrapper: document.querySelector('.configurator-wrapper')
  };
}

export function showStep(stepNumber, elements, config) {
  const { animationDuration } = config.ui;
  elements.steps.forEach(step => {
    step.style.display = 'none';
    step.classList.remove('active');
  });

  const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
  if (currentStepEl) {
    currentStepEl.style.display = 'block';
    currentStepEl.classList.add('active');
    currentStepEl.style.opacity = '0';
    currentStepEl.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      currentStepEl.style.transition = `opacity ${animationDuration}ms ease, transform ${animationDuration}ms ease`;
      currentStepEl.style.opacity = '1';
      currentStepEl.style.transform = 'translateY(0)';
    });
  }
}

export function updateNavButtons(currentStep, totalSteps, elements) {
  if (elements.btnPrevious) elements.btnPrevious.style.display = currentStep > 1 ? 'block' : 'none';
  if (elements.btnNext) elements.btnNext.style.display = currentStep < totalSteps ? 'block' : 'none';
  if (elements.btnSubmit) elements.btnSubmit.style.display = currentStep === totalSteps ? 'block' : 'none';
}

export function updateProgress(currentStep, totalSteps, elements, config) {
  if (elements.progress) {
    const percentage = (currentStep / totalSteps) * 100;
    elements.progress.style.width = `${percentage}%`;
    elements.progress.style.transition = `width ${config.ui.animationDuration}ms ease`;
  }
}

export function updatePreviewImage(imageUrl, elements, config) {
  if (!elements.preview || !imageUrl) return;
  const { animationDuration } = config.ui;
  elements.preview.style.transition = `opacity ${animationDuration / 2}ms ease`;
  elements.preview.style.opacity = '0';
  setTimeout(() => {
    elements.preview.src = imageUrl;
    elements.preview.style.opacity = '1';
  }, animationDuration / 2);
}

export function highlightSelection(card, optionType) {
  const siblings = document.querySelectorAll(`[data-option="${optionType}"]`);
  siblings.forEach(sibling => sibling.classList.remove('selected'));
  card.classList.add('selected');
  const radio = card.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

export function showValidationError(currentStep, config) {
  const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
  if (!currentStepEl) return;
  currentStepEl.classList.add('shake');
  setTimeout(() => currentStepEl.classList.remove('shake'), 500);
  const options = currentStepEl.querySelectorAll('[data-option]');
  options.forEach(opt => {
    if (!opt.classList.contains('selected')) {
      opt.classList.add('highlight-required');
      setTimeout(() => opt.classList.remove('highlight-required'), 2000);
    }
  });
}

export function setSubmitLoading(isLoading, elements, config) {
  if (!elements.btnSubmit) return;
  elements.btnSubmit.disabled = isLoading;
  elements.btnSubmit.textContent = isLoading ? config.ui.text.btnSubmitting : config.ui.text.btnSubmit;
}

export function showThankYou(elements) {
  if (elements.wrapper) elements.wrapper.style.display = 'none';
  if (elements.thankYou) elements.thankYou.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function highlightDateChip(chip) {
  document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
}