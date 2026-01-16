const defaultConfig = {
  airtable: {
    enabled: true,
    apiKey: '',
    baseId: '',
    tableName: 'Submissions',
    fieldMapping: {
      model: 'Model',
      size: 'Size',
      rim: 'Rim',
      interiorFinish: 'Interior Finish',
      exteriorFinish: 'Exterior Finish',
      color: 'Color',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      installationDate: 'Installation Date',
      submittedAt: 'Submitted At',
      sourceUrl: 'Source URL'
    }
  },
  webhook: {
    enabled: false,
    url: '',
    headers: {}
  },
  ui: {
    animationDuration: 300,
    accentColor: '#FF6B4A',
    text: {
      btnNext: 'Next',
      btnPrevious: 'Previous',
      btnSubmit: 'Request quote',
      btnSubmitting: 'Submitting...'
    }
  },
  callbacks: {
    onStepChange: null,
    onSelectionChange: null,
    onSubmitStart: null,
    onSubmitSuccess: null,
    onSubmitError: null
  }
};

export function getConfig() {
  const userConfig = window.LOHO_CONFIG || {};
  return deepMerge(defaultConfig, userConfig);
}

function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

export default defaultConfig;