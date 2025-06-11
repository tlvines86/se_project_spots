export function setButtonText(btn, isLoading, defaultText, loadingText) {
  if (isLoading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = defaultText;
  }
}
