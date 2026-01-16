export function createState() {
  return {
    currentStep: 1,
    totalSteps: 6,
    selections: {
      model: 'linea',
      size: null,
      rim: null,
      'interior-finish': null,
      'exterior-finish': null,
      color: null
    },
    formData: {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      installation: null
    },
    ui: {
      isSubmitting: false,
      hasError: false,
      errorMessage: ''
    }
  };
}

export function updateSelection(state, optionType, value) {
  state.selections[optionType] = value;
  return state;
}

export function updateFormData(state, field, value) {
  state.formData[field] = value;
  return state;
}

export function setStep(state, step) {
  state.currentStep = step;
  return state;
}

export function getSubmissionData(state) {
  return {
    model: state.selections.model,
    size: state.selections.size,
    rim: state.selections.rim,
    interior_finish: state.selections['interior-finish'],
    exterior_finish: state.selections['exterior-finish'],
    color: state.selections.color,
    firstname: state.formData.firstname,
    lastname: state.formData.lastname,
    email: state.formData.email,
    phone: state.formData.phone,
    installation_date: state.formData.installation,
    submitted_at: new Date().toISOString(),
    source: window.location.href
  };
}