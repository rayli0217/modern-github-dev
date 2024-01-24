defineCustomElement('quick-add-modal', () => {
  return class QuickAddModal extends DetailsModal {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
    }

    close() {
      this.modalContent.innerHTML = '';
      super.close().then(() => {
        document.body.dispatchEvent(new CustomEvent('modalClosed'));
      });
    }

    connectedCallback() {
      if (this.moved) return;
      this.moved = true;
      document.body.appendChild(this);
    }

    open(opener) {
      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.add('display-flex');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          this.preventDuplicatedIDs();
          this.removeDOMElements();
          this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

          if (window.Shopline && window.Shopline.PaymentButton) {
            window.Shopline.PaymentButton.init();
          }
          this.preventVariantURLSwitching();
          super.open(opener);
        })
        .finally(() => {
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.remove('display-flex');
        });
    }

    setInnerHTML(element, html) {
      
      element.innerHTML = html;

      // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      element.querySelectorAll('script').forEach((oldScriptTag) => {
        const newScriptTag = document.createElement('script');
        Array.from(oldScriptTag.attributes).forEach((attribute) => {
          newScriptTag.setAttribute(attribute.name, attribute.value);
        });
        newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
        oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      });
    }

    preventVariantURLSwitching() {
      const variantPicker = this.modalContent.querySelector('variant-radios,variant-selects');
      if (!variantPicker) return;

      variantPicker.setAttribute('data-update-url', 'false');
    }

    removeDOMElements() {
      const productModal = this.productElement.querySelector('product-modal');
      if (productModal) productModal.remove();

      const modalDialog = this.productElement.querySelectorAll('modal-dialog');
      if (modalDialog) modalDialog.forEach((modal) => modal.remove());
    }

    preventDuplicatedIDs() {
      const sectionId = this.productElement.dataset.section;
      this.productElement.innerHTML = this.productElement.innerHTML.replace(
        new RegExp(sectionId, 'g'),
        `quickadd-${sectionId}`,
      );
      this.productElement.querySelectorAll('variant-selects, variant-radios').forEach((variantSelect) => {
        
        variantSelect.dataset.originalSection = sectionId;
      });
    }
  };
});
