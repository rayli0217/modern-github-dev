defineCustomElement('product-form', () => {
  return class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      if (!this.form) {
        return;
      }

      this.options = {
        onErrorShowToast: this.dataset.onErrorShowToast || false,
      };

      this.fetchInstance = Promise.resolve();
      this.form.querySelector('[name=id]').disabled = false;
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer-entry');
      this.submitButton = this.querySelector('[type="submit"]');
      this.submitButton.addEventListener('click', this.submitButtonClickHandler.bind(this));
    }

    // Because the editor hijack the a tag click event, the click event needs to be bound to prevent bubbling
    submitButtonClickHandler(e) {
      e.preventDefault();
      e.stopPropagation();
      this.onSubmitHandler();
    }

    onSubmitHandler() {
      if (this.submitButton.classList.contains('disabled') || this.submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();

      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.add('display-flex');

      const config = window.fetchConfig();
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      const formData = new FormData(this.form);
      this.ensureQuantity(formData);
      formData.delete('returnTo');
      if (this.cart) {
        formData.append(
          'sections',
          this.cart.getSectionsToRender().map((section) => section.id),
        );
        formData.append('sections_url', window.location.pathname);
      }
      config.body = formData;
      const fetchInstance = fetch(`${window.routes.cart_add_url}`, config).then((response) => response.json());
      this.fetchInstance = fetchInstance;
      fetchInstance
        .then((response) => {
          if (response.message) {
            this.handleErrorMessage(response.message);
            const isQuickAdd = this.submitButton.classList.contains('quick-add__submit');
            if (!isQuickAdd) return response;
            this.submitButton.classList.add('disabled');
            this.submitButton.querySelector('span').classList.add('hidden');
            this.error = true;
            return response;
          }
          if (!this.cart) {
            window.location = window.routes.cart_url;
            return response;
          }

          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          const SLQuickAddModal = (window.Shopline.utils || {}).quickAddModal;
          if (quickAddModal) {
            document.body.addEventListener(
              'modalClosed',
              () => {
                setTimeout(() => {
                  this.cart.renderContents(response);
                });
              },
              { once: true },
            );
            quickAddModal.close(true);
          } else if (SLQuickAddModal) {
            SLQuickAddModal.close().then(() => this.cart.renderContents(response));
          } else {
            this.cart.renderContents(response);
          }
          return response;
        })
        .catch((err) => {
          console.error('product form err', err);
          this.handleErrorMessage(this.getAttribute('data-default-error-message'));
        })
        .finally((response) => {
          this.submitButton.classList.remove('loading');
          this.querySelector('.loading-overlay__spinner').classList.remove('display-flex');
          return response;
        });
    }

    ensureQuantity(formData) {
      if (!formData.has('quantity')) {
        formData.set('quantity', '1');
      }
    }

    handleErrorMessage(errorMessage = false) {
      if (this.options.onErrorShowToast && errorMessage) {
        window.Shopline.utils.toast.open({
          content: errorMessage,
        });
      }
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  };
});

window.Shopline.loadFeatures(
  [
    {
      name: 'component-toast',
      version: '0.1',
    },
  ],
  function (error) {
    if (error) {
      throw error;
    }
  },
);
