/**
 * LOHO - Main entry point
 * Imports and initializes all modules
 */
import { initConfigurator } from './configurator.js'
import { initModal } from './modal.js'

;(function () {
  'use strict'

  function init() {
    initConfigurator()
    initModal()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
