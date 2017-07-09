// ==UserScript==
// @name        WaniKani GFM Notes
// @namespace   https://seangenabe.gitlab.io/wanikani-gfm-notes
// @description Write Github-flavored Markdown in the notes.
// @version     0.0.0.DYNAMIC_VERSION_NUMBER
// @require     https://unpkg.com/marked@0.3.6
// @include     https://www.wanikani.com/radicals/*
// @include     https://www.wanikani.com/level/*
// @include     https://www.wanikani.com/kanji/*
// @include     https://www.wanikani.com/vocabulary/*
// @include     https://www.wanikani.com/review/session
// @grant       none
// @downloadURL https://seangenabe.gitlab.io/wanikani-gfm-notes/index.user.js
// @updateURL   https://seangenabe.gitlab.io/wanikani-gfm-notes/index.user.js
// @run-at      document-end
// ==/UserScript==
/* global marked:false */

(function() {

  const NOTE_ELEMENT_SELECTOR = '.note-meaning,.note-reading'
  const EMPTY_NOTE_PLACEHOLDER = 'Click to add note'
  const noteElements = new Set()

  function hookNoteElement(note) {
    let plaintext = note.innerHTML
    if (!plaintext || plaintext === EMPTY_NOTE_PLACEHOLDER) {
      plaintext = ''
    }

    function refreshNoteHtml() {
      note.innerHTML = marked(plaintext) || EMPTY_NOTE_PLACEHOLDER
    }
    refreshNoteHtml()

    let o = new MutationObserver(records => {
      for (let record of records) {
        for (let n of record.addedNodes) {
          if (n instanceof Element) {
            if (n.matches('textarea')) {
              // `textarea` added, set plaintext.
              n.value = plaintext
            }
            else if (n.matches('button[type="submit"]')) {
              n.addEventListener('click', () => {
                // Set new text value, apply when form is removed.
                plaintext = note.querySelector('textarea').value
              })
            }
          }
        }
        for (let n of record.removedNodes) {
          if (record.target === note &&
              n instanceof Element && n.matches('form')) {
            // Form removed; re-render note.
            refreshNoteHtml()
          }
        }
      }
    })
    o.observe(note, { childList: true, subtree: true })
  }

  if (location.pathname === '/review/session') {
    let o = new MutationObserver(records => {
      for (let record of records) {
        for (let n of record.addedNodes) {
          if (n instanceof Element && n.matches(NOTE_ELEMENT_SELECTOR) && !noteElements.has(n)) {

            noteElements.add(n)
            hookNoteElement(n)

            if (noteElements.length === 2) {
              o.disconnect()
            }
          }
        }
      }
    })
    o.observe(document.body, { childList: true, subtree: true })
  }
  else {
    document.querySelectorAll(NOTE_ELEMENT_SELECTOR)
      .forEach(n => hookNoteElement(n))
  }
})()
