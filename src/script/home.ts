import domready from './domready';

// Force require to be null on browser window scope
// This is due to how cannon.js (physics engine) got
// packed in the bundle where it will fail if require
// is not defined.
if (window) {
  window['require'] = null;
}

function deobfuscate_data_href() {
  document.querySelectorAll('a[data-href-obfs]').forEach(node => {
    let obfuscated_data = node.getAttribute('data-href-obfs');
    node.setAttribute('href', atob(obfuscated_data));
  })
}

domready(() => {
  deobfuscate_data_href();
});