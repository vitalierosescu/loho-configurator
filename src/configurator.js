/**
 * LOHO Bath Configurator v3
 * Multi-step product configurator with GSAP animations
 */

// ============================================
// CONFIG
// ============================================
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
      sourceUrl: 'Source URL',
    },
  },
  webhook: {
    enabled: false,
    url: '',
    headers: {},
  },
}

function deepMerge(target, source) {
  var output = Object.assign({}, target)
  for (var key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = deepMerge(target[key], source[key])
    } else {
      output[key] = source[key]
    }
  }
  return output
}

function getConfig() {
  var userConfig = window.LOHO_CONFIG || {}
  return deepMerge(defaultConfig, userConfig)
}

// ============================================
// STATE
// ============================================
var state = {
  currentStep: 1,
  totalSteps: 6,
  selections: {
    model: null,
    size: null,
    rim: null,
    'interior-finish': null,
    'exterior-finish': null,
    color: null,
  },
  formData: {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    installation: null,
  },
}

// ============================================
// STORAGE
// ============================================
var STORAGE_KEY = 'loho_configurator_state'

function saveToStorage() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selections: state.selections,
        formData: state.formData,
        currentStep: state.currentStep,
      })
    )
  } catch (e) {
    console.warn('Could not save to localStorage:', e)
  }
}

function loadFromStorage() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      var data = JSON.parse(saved)
      if (data.selections) state.selections = Object.assign({}, state.selections, data.selections)
      if (data.formData) state.formData = Object.assign({}, state.formData, data.formData)
      if (data.currentStep) state.currentStep = data.currentStep
      return true
    }
  } catch (e) {
    console.warn('Could not load from localStorage:', e)
  }
  return false
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Could not clear localStorage:', e)
  }
}

// ============================================
// DOM ELEMENTS
// ============================================
var elements = {}

function cacheElements() {
  elements = {
    steps: document.querySelectorAll('[data-step]'),
    options: document.querySelectorAll('[data-option]'),
    preview: document.querySelector('[data-preview]'),
    progress: document.querySelector('[data-progress]'),
    btnNext: document.querySelector('[data-nav="next"]'),
    btnPrevious: document.querySelector('[data-nav="previous"]'),
    btnSubmit: document.querySelector('[data-nav="submit"]'),
    form: document.getElementById('configurator-form'),
    thankYou: document.querySelector('[data-thank-you]'),
    wrapper: document.querySelector('.configurator-wrapper'),
    validationMsg: document.querySelector('[data-validation-message]'),
  }

  if (!elements.validationMsg && elements.btnNext) {
    var msgEl = document.createElement('div')
    msgEl.setAttribute('data-validation-message', '')
    msgEl.className = 'validation-message'
    elements.btnNext.parentNode.insertBefore(msgEl, elements.btnNext.nextSibling)
    elements.validationMsg = msgEl
  }
}

// ============================================
// VALIDATION
// ============================================
function getStepValidation(stepNumber) {
  switch (stepNumber) {
    case 1:
      return {
        isValid: state.selections.model !== null,
        message: 'Please select a model to continue',
      }
    case 2:
      return {
        isValid: state.selections.size !== null,
        message: 'Please select a size to continue',
      }
    case 3:
      return {
        isValid: state.selections.rim !== null,
        message: 'Please select a rim style to continue',
      }
    case 4:
      var hasInterior = state.selections['interior-finish'] !== null
      var hasExterior = state.selections['exterior-finish'] !== null
      var message = ''
      if (!hasInterior && !hasExterior) {
        message = 'Please select an interior finish and an exterior finish'
      } else if (!hasInterior) {
        message = 'Please select an interior finish'
      } else if (!hasExterior) {
        message = 'Please select an exterior finish'
      }
      return { isValid: hasInterior && hasExterior, message: message }
    case 5:
      return {
        isValid: state.selections.color !== null,
        message: 'Please select a color to continue',
      }
    case 6:
      return validateForm()
    default:
      return { isValid: true, message: '' }
  }
}

function validateForm() {
  var errors = []
  if (!state.formData.email || !state.formData.email.includes('@')) {
    errors.push('Please enter a valid email address')
  }
  if (!state.formData.installation) {
    errors.push('Please select an installation timeframe')
  }
  return {
    isValid: errors.length === 0,
    message: errors.join('. '),
  }
}

function showValidationMessage(message) {
  if (elements.validationMsg) {
    elements.validationMsg.textContent = message
    elements.validationMsg.classList.add('is-visible')
    if (window.gsap) {
      gsap.fromTo(
        elements.validationMsg,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }
      )
    }
  }
}

function hideValidationMessage() {
  if (elements.validationMsg) {
    elements.validationMsg.classList.remove('is-visible')
    elements.validationMsg.textContent = ''
  }
}

// ============================================
// BUTTON STATES
// ============================================
function updateNextButtonState() {
  if (!elements.btnNext) return
  var validation = getStepValidation(state.currentStep)
  if (validation.isValid) {
    elements.btnNext.classList.remove('is-disabled')
    elements.btnNext.disabled = false
  } else {
    elements.btnNext.classList.add('is-disabled')
    elements.btnNext.disabled = false
  }
}

function updateNavButtons() {
  if (elements.btnPrevious) {
    elements.btnPrevious.style.display = state.currentStep > 1 ? 'block' : 'none'
  }
  if (elements.btnNext) {
    elements.btnNext.style.display = 'block'
    elements.btnNext.textContent = state.currentStep < state.totalSteps ? 'Next' : 'Request quote'
  }
  if (elements.btnSubmit) {
    elements.btnSubmit.style.display = 'none'
  }
  updateNextButtonState()
  hideValidationMessage()
}

function updateProgress() {
  if (elements.progress) {
    var percentage = (state.currentStep / state.totalSteps) * 100
    if (window.gsap) {
      gsap.to(elements.progress, {
        width: percentage + '%',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      })
    } else {
      elements.progress.style.width = percentage + '%'
    }
  }
}

// ============================================
// GSAP ANIMATIONS
// ============================================
var ANIM = {
  outDuration: 0.25,
  inDuration: 0.4,
  stagger: 0.03,
  maxStagger: 0.25,
  yShift: 20,
}

// Cache animatable children per step (built once on init)
var stepChildrenCache = {}

function getStepChildren(stepEl) {
  var stepId = stepEl.getAttribute('data-step')
  if (stepChildrenCache[stepId]) return stepChildrenCache[stepId]

  var children = stepEl.querySelectorAll(
    '.step-title, .step-subtitle, .step-link, .modal_button, .finish-label, .form-label, .option-card, .color-swatch, .date-chip, .form-input, .step-note, .form-group'
  )
  var arr = Array.from(children)
  stepChildrenCache[stepId] = arr
  return arr
}

function getStagger(count) {
  if (count <= 1) return 0
  var total = ANIM.stagger * (count - 1)
  return total > ANIM.maxStagger ? ANIM.maxStagger / (count - 1) : ANIM.stagger
}

function animateStepOut(stepEl) {
  return new Promise(function (resolve) {
    if (!window.gsap || !stepEl) {
      if (stepEl) stepEl.style.display = 'none'
      resolve()
      return
    }

    var children = getStepChildren(stepEl)

    // Single timeline: fade container + slide children
    var tl = gsap.timeline({
      onComplete: function () {
        stepEl.style.display = 'none'
        // Reset with transforms only (no clearProps layout thrash)
        gsap.set(children, { y: 0, clearProps: 'opacity' })
        resolve()
      },
    })

    tl.to(stepEl, {
      autoAlpha: 0,
      duration: ANIM.outDuration,
      ease: 'power2.in',
      force3D: true,
    })
  })
}

function animateStepIn(stepEl) {
  return new Promise(function (resolve) {
    if (!stepEl) {
      resolve()
      return
    }

    stepEl.style.display = 'block'

    if (!window.gsap) {
      resolve()
      return
    }

    var children = getStepChildren(stepEl)
    var stagger = getStagger(children.length)

    // Set initial state
    gsap.set(stepEl, { autoAlpha: 1 })
    gsap.set(children, { opacity: 0, y: ANIM.yShift, force3D: true })

    // Stagger children in
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: ANIM.inDuration,
      stagger: stagger,
      ease: 'power2.out',
      force3D: true,
      overwrite: 'auto',
      onComplete: resolve,
    })
  })
}

// ============================================
// STEP NAVIGATION
// ============================================
var isAnimating = false

function goToStep(stepNumber) {
  if (isAnimating) return
  isAnimating = true

  var currentStepEl = document.querySelector('[data-step="' + state.currentStep + '"]')
  var nextStepEl = document.querySelector('[data-step="' + stepNumber + '"]')

  animateStepOut(currentStepEl)
    .then(function () {
      state.currentStep = stepNumber
      saveToStorage()
      updateNavButtons()
      updateProgress()
      return animateStepIn(nextStepEl)
    })
    .then(function () {
      isAnimating = false
    })
}

function nextStep() {
  var validation = getStepValidation(state.currentStep)
  if (!validation.isValid) {
    showValidationMessage(validation.message)
    if (window.gsap && elements.btnNext) {
      gsap.to(elements.btnNext, {
        keyframes: [
          { x: -5, duration: 0.05 },
          { x: 5, duration: 0.05 },
          { x: -3, duration: 0.05 },
          { x: 3, duration: 0.05 },
          { x: 0, duration: 0.05 },
        ],
        ease: 'none',
        overwrite: true,
      })
    }
    return
  }
  hideValidationMessage()
  if (state.currentStep < state.totalSteps) {
    goToStep(state.currentStep + 1)
  } else {
    handleSubmit()
  }
}

function previousStep() {
  hideValidationMessage()
  if (state.currentStep > 1) {
    goToStep(state.currentStep - 1)
  }
}

// ============================================
// SELECTION HANDLING
// ============================================

/**
 * Resolve the actual value for a card click.
 * Webflow components bake the same data-value into all instances,
 * so for colors we derive a unique slug from the color name text.
 */
function resolveCardValue(card) {
  var value = card.dataset.value
  var nameEl = card.querySelector('.color-name-text')
  if (nameEl) {
    var slug = nameEl.textContent.trim().toLowerCase().replace(/\s+/g, '-')
    if (slug) value = slug
  }
  return value
}

function handleOptionClick(e) {
  var card = e.target.closest('[data-option]')
  if (!card) return
  var optionType = card.dataset.option
  var value = resolveCardValue(card)
  var imageUrl = card.dataset.image || ''

  if (!value) return

  state.selections[optionType] = value
  saveToStorage()

  var siblings = document.querySelectorAll('[data-option="' + optionType + '"]')
  siblings.forEach(function (sibling) {
    sibling.classList.remove('selected')
  })
  card.classList.add('selected')

  var radio = card.querySelector('input[type="radio"]')
  if (radio) radio.checked = true

  if (optionType === 'color' && imageUrl) {
    updatePreviewImage(imageUrl)
  }

  updateNextButtonState()
  hideValidationMessage()
}

function handleFormInput(e) {
  var input = e.target
  var name = input.name
  if (name && state.formData.hasOwnProperty(name)) {
    state.formData[name] = input.value
    saveToStorage()
  }
  updateNextButtonState()
}

function handleDateChipClick(e) {
  var chip = e.target.closest('.date-chip')
  if (!chip) return
  document.querySelectorAll('.date-chip').forEach(function (c) {
    c.classList.remove('selected')
  })
  chip.classList.add('selected')
  var radio = chip.querySelector('input[type="radio"]')
  if (radio) {
    radio.checked = true
    state.formData.installation = radio.value
    saveToStorage()
  }
  updateNextButtonState()
  hideValidationMessage()
}

// ============================================
// PREVIEW IMAGE
// ============================================
function updatePreviewImage(imageUrl) {
  if (!elements.preview || !imageUrl) return
  if (window.gsap) {
    gsap.to(elements.preview, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: function () {
        elements.preview.src = imageUrl
        if (elements.preview.complete) {
          gsap.to(elements.preview, { opacity: 1, duration: 0.4, ease: 'power2.out' })
        } else {
          elements.preview.onload = function () {
            gsap.to(elements.preview, { opacity: 1, duration: 0.4, ease: 'power2.out' })
            elements.preview.onload = null
          }
        }
      },
    })
  } else {
    elements.preview.src = imageUrl
  }
}

// ============================================
// FORM SUBMISSION
// ============================================
function handleSubmit(e) {
  if (e) e.preventDefault()
  var formInputs = elements.form ? elements.form.querySelectorAll('input') : []
  formInputs.forEach(function (input) {
    if (input.name && input.type !== 'radio') {
      state.formData[input.name] = input.value
    }
    if (input.type === 'radio' && input.checked) {
      state.formData[input.name] = input.value
    }
  })
  var validation = validateForm()
  if (!validation.isValid) {
    showValidationMessage(validation.message)
    return
  }
  var submissionData = {
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
    source: window.location.href,
  }
  if (elements.btnNext) {
    elements.btnNext.disabled = true
    elements.btnNext.textContent = 'Submitting...'
    elements.btnNext.classList.add('is-loading')
  }
  var config = getConfig()
  var submitPromise
  if (config.airtable.enabled && config.airtable.apiKey) {
    submitPromise = submitToAirtable(submissionData, config)
  } else if (config.webhook.enabled && config.webhook.url) {
    submitPromise = submitToWebhook(submissionData, config)
  } else {
    submitPromise = new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ success: true, demo: true })
      }, 1000)
    })
  }
  submitPromise
    .then(function () {
      clearStorage()
      showThankYou()
    })
    .catch(function (error) {
      console.error('Submission error:', error)
      showValidationMessage('Something went wrong. Please try again or contact us directly.')
      if (elements.btnNext) {
        elements.btnNext.disabled = false
        elements.btnNext.textContent = 'Request quote'
        elements.btnNext.classList.remove('is-loading')
      }
    })
}

function submitToAirtable(data, config) {
  var apiKey = config.airtable.apiKey
  var baseId = config.airtable.baseId
  var tableName = config.airtable.tableName
  var fieldMapping = config.airtable.fieldMapping
  var url = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent(tableName)
  var fields = {}
  fields[fieldMapping.model] = data.model
  fields[fieldMapping.size] = data.size
  fields[fieldMapping.rim] = data.rim
  fields[fieldMapping.interiorFinish] = data.interior_finish
  fields[fieldMapping.exteriorFinish] = data.exterior_finish
  fields[fieldMapping.color] = data.color
  fields[fieldMapping.firstName] = data.firstname
  fields[fieldMapping.lastName] = data.lastname
  fields[fieldMapping.email] = data.email
  fields[fieldMapping.phone] = data.phone
  fields[fieldMapping.installationDate] = data.installation_date
  fields[fieldMapping.submittedAt] = data.submitted_at
  fields[fieldMapping.sourceUrl] = data.source
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields: fields }] }),
  }).then(function (response) {
    if (!response.ok) {
      return response.json().then(function (err) {
        throw new Error(err.error ? err.error.message : 'Submission failed')
      })
    }
    return response.json()
  })
}

function submitToWebhook(data, config) {
  var url = config.webhook.url
  var headers = config.webhook.headers || {}
  return fetch(url, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    body: JSON.stringify(data),
  }).then(function (response) {
    if (!response.ok) {
      throw new Error('Submission failed: ' + response.status)
    }
    return response.json().catch(function () {
      return { success: true }
    })
  })
}

// ============================================
// THANK YOU SCREEN
// ============================================
function showThankYou() {
  if (window.gsap) {
    gsap
      .timeline()
      .to(elements.wrapper, { opacity: 0, duration: 0.4, ease: 'power2.in' })
      .call(function () {
        elements.wrapper.style.display = 'none'
        elements.thankYou.style.display = 'flex'
      })
      .fromTo(elements.thankYou, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .fromTo(
        elements.thankYou.querySelectorAll('.thank-you-content > *'),
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.3'
      )
  } else {
    elements.wrapper.style.display = 'none'
    elements.thankYou.style.display = 'flex'
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ============================================
// RESTORE STATE FROM STORAGE
// ============================================
function restoreUIFromState() {
  Object.keys(state.selections).forEach(function (optionType) {
    var value = state.selections[optionType]
    if (!value) return

    // Try direct data-value match first
    var card = document.querySelector(
      '[data-option="' + optionType + '"][data-value="' + value + '"]'
    )

    // For color swatches: match by color name slug (component instances share data-value)
    if (!card && optionType === 'color') {
      var allSwatches = document.querySelectorAll('[data-option="color"]')
      for (var i = 0; i < allSwatches.length; i++) {
        if (resolveCardValue(allSwatches[i]) === value) {
          card = allSwatches[i]
          break
        }
      }
    }

    if (card) {
      card.classList.add('selected')
      var radio = card.querySelector('input[type="radio"]')
      if (radio) radio.checked = true
      var imageUrl = card.dataset.image
      if (optionType === 'color' && imageUrl && elements.preview) {
        elements.preview.src = imageUrl
      }
    }
  })
  Object.keys(state.formData).forEach(function (field) {
    var value = state.formData[field]
    if (value) {
      var input = document.querySelector('[name="' + field + '"]')
      if (input) {
        if (input.type === 'radio') {
          var radio = document.querySelector('[name="' + field + '"][value="' + value + '"]')
          if (radio) {
            radio.checked = true
            var chip = radio.closest('.date-chip')
            if (chip) chip.classList.add('selected')
          }
        } else {
          input.value = value
        }
      }
    }
  })
}

// ============================================
// INIT (exported)
// ============================================
export function initConfigurator() {
  cacheElements()

  var hasStoredState = loadFromStorage()

  document.addEventListener('click', handleOptionClick)
  document.addEventListener('click', handleDateChipClick)

  if (elements.btnNext) {
    elements.btnNext.addEventListener('click', nextStep)
  }
  if (elements.btnPrevious) {
    elements.btnPrevious.addEventListener('click', previousStep)
  }
  if (elements.form) {
    elements.form.addEventListener('input', handleFormInput)
    elements.form.addEventListener('submit', handleSubmit)
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
      nextStep()
    }
  })

  if (hasStoredState) {
    restoreUIFromState()
  }

  elements.steps.forEach(function (step, index) {
    step.style.display = index + 1 === state.currentStep ? 'block' : 'none'
  })

  updateNavButtons()
  updateProgress()

  window.LOHOConfigurator = {
    state: state,
    goToStep: goToStep,
    nextStep: nextStep,
    previousStep: previousStep,
    clearStorage: clearStorage,
  }
}
