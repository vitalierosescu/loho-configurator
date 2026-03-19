/**
 * LOHO Modal
 * GSAP-powered slide-in dialog with backdrop
 * Expects: .modal_dialog[data-modal-id], .modal_backdrop, .modal_content,
 *          [data-modal-trigger="id"], [data-modal-close]
 */

export function initModal() {
  document.querySelectorAll('.modal_dialog').forEach(function (component) {
    if (component.hasAttribute('data-modal')) return
    component.setAttribute('data-modal', '')

    var lastFocusedElement

    if (typeof gsap !== 'undefined') {
      gsap.context(function () {
        component.tl = gsap.timeline({ paused: true, onReverseComplete: resetModal })
        component.tl.from('.modal_backdrop', { opacity: 0, duration: 0.8 })
        component.tl.from(
          '.modal_content',
          { xPercent: 100, ease: 'power2.inOut', duration: 1.6 },
          '<'
        )
      }, component)
    }

    function resetModal() {
      if (typeof lenis !== 'undefined' && lenis.start) {
        lenis.start()
      } else {
        document.body.style.overflow = ''
      }
      component.close()
      if (lastFocusedElement) lastFocusedElement.focus()
      window.dispatchEvent(new CustomEvent('modal-close', { detail: { component } }))
    }

    function openModal() {
      if (typeof lenis !== 'undefined' && lenis.stop) {
        lenis.stop()
      } else {
        document.body.style.overflow = 'hidden'
      }
      lastFocusedElement = document.activeElement
      component.showModal()
      if (typeof gsap !== 'undefined') component.tl.play()
      component
        .querySelectorAll('.modal_scroll')
        .forEach(function (el) {
          el.scrollTop = 0
        })
      window.dispatchEvent(new CustomEvent('modal-open', { detail: { component } }))
    }

    function closeModal() {
      if (typeof gsap !== 'undefined') {
        component.tl.timeScale(1.35).reverse()
      } else {
        resetModal()
      }
    }

    // Auto-open if modal-id matches URL param
    var urlModalId = new URLSearchParams(location.search).get('modal-id')
    if (urlModalId === component.getAttribute('data-modal-id')) {
      openModal()
      var cleanUrl = new URL(location.href)
      cleanUrl.searchParams.delete('modal-id')
      history.replaceState({}, '', cleanUrl)
    }

    // Close on cancel (Escape key)
    component.addEventListener('cancel', function (e) {
      e.preventDefault()
      closeModal()
    })

    // Close button inside modal
    component.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]')) closeModal()
    })

    // Open triggers anywhere on the page
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest(
        "[data-modal-trigger='" + component.getAttribute('data-modal-id') + "']"
      )
      if (trigger) openModal()
    })
  })
}
