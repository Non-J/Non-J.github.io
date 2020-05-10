function domready(callback: Function) {
  if (typeof document === 'undefined') {
    throw new Error('document-ready only runs in the browser');
  }
  let state = document.readyState;
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(callback, 0);
  }
  document.addEventListener('DOMContentLoaded', function onLoad() {
    callback();
  });
}

export default domready; 