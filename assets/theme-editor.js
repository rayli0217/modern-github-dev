document.addEventListener('shopline:section:unload', (event) => {
  const { sectionId } = event.detail;

  const productModal = document.querySelector(`#ProductModal-${sectionId}`);

  if (productModal) {
    productModal.remove();
  }
});
