export function validateStep(stepNumber, state) {
  switch (stepNumber) {
    case 1: return state.selections.model !== null;
    case 2: return state.selections.size !== null;
    case 3: return state.selections.rim !== null;
    case 4: return state.selections['interior-finish'] !== null && state.selections['exterior-finish'] !== null;
    case 5: return state.selections.color !== null;
    case 6: return validateForm(state);
    default: return true;
  }
}

export function validateForm(state) {
  const email = state.formData.email;
  const installation = state.formData.installation;
  if (!email || !isValidEmail(email)) return false;
  if (!installation) return false;
  return true;
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getValidationErrors(state) {
  const errors = [];
  if (!state.formData.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(state.formData.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (!state.formData.installation) {
    errors.push({ field: 'installation', message: 'Please select an installation date' });
  }
  return errors;
}