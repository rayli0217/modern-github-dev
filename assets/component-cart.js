defineCustomElement(
  'cart-remove-button',
  () =>
    class CartRemoveButton extends HTMLElement {
      constructor() {
        super();
        this.addEventListener('click', (event) => {
          event.preventDefault();
          const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
          const currentCartItem = event.target.closest('.cart-item');
          const currentCartItemKey = currentCartItem.dataset.key;
          const currentCartItemQuantity = currentCartItem.querySelector('[name="quantity"]').value;
          // Get the same product quantity（Certain marketing campaigns may generate）
          const sameProductQuantity = Array.from(
            cartItems.querySelectorAll(`[data-key="${currentCartItemKey}"] [name="quantity"]`),
          ).reduce((total, quantityInput) => total + parseInt(quantityInput.value, 10), 0);
          cartItems.updateQuantity(currentCartItemKey, sameProductQuantity - currentCartItemQuantity);
        });
      }
    },
);

defineCustomElement(
  'cart-items',
  () =>
    class CartItems extends HTMLElement {
      constructor() {
        super();

        this.debouncedOnChange = window.debounce((event) => {
          this.onChange(event);
        }, 300);

        this.currentItemCount = Array.from(this.querySelectorAll('[name="quantity"]')).reduce(
          (total, quantityInput) => total + parseInt(quantityInput.value, 10),
          0,
        );

        this.addEventListener('change', this.debouncedOnChange.bind(this));
      }

      onChange(event) {
        const cartItemKey = event.target.closest('.cart-item').dataset.key;
        // Get the same product quantity（Certain marketing campaigns may generate）
        const sameProductQuantity = Array.from(
          this.querySelectorAll(`[data-key="${cartItemKey}"] [name="quantity"]`),
        ).reduce((total, quantityInput) => total + parseInt(quantityInput.value, 10), 0);
        this.updateQuantity(cartItemKey, sameProductQuantity);
      }

      getSectionsToRender() {
        const filterNoExistElem = (item) => {
          const foundElement =
            document.getElementById(item.id).querySelector(item.selector) || document.getElementById(item.id);
          return Boolean(foundElement);
        };
        const mainCartItemsDataset = document.getElementById('main-cart-items').dataset;
        const showFixedCheckout = mainCartItemsDataset.showFixedCheckout === 'true';

        return [
          {
            id: 'main-cart-items',
            section: document.getElementById('main-cart-items').dataset.id,
            selector: '.main-cart-items-container',
          },
          {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '#cart-icon-bubble-wrapper',
          },
          {
            id: 'main-cart-footer',
            section: document.getElementById('main-cart-footer').dataset.id,
            selectors: [
              '.cart__amount-wrapper',
              showFixedCheckout ? '.cart-fixed-checkout__amount' : null,
              '.cart-fixed-checkout__footer .cart__total',
            ],
          },
        ].filter(filterNoExistElem);
      }

      updateQuantity(id, quantity) {
        this.enableLoading(id);
        const body = JSON.stringify({
          id,
          quantity,
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname,
        });

        fetch(`${window.routes.cart_change_url}`, {
          ...window.fetchConfig(),
          ...{
            body,
          },
        })
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);
            // this.classList.toggle('cart-empty', parsedState.item_count === 0);
            const cartItems = document.querySelector('cart-items');
            const cartFooter = document.getElementById('main-cart-footer');
            if (cartItems) cartItems.classList.toggle('cart-empty', parsedState.item_count === 0);
            if (cartFooter) cartFooter.classList.toggle('cart-empty', parsedState.item_count === 0);

            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer) {
              const cartDrawerWrapper = cartDrawer.querySelector('.cart-drawer__inner-wrapper');
              if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('cart-empty', parsedState.item_count === 0);
            }
            const replaceElement = (section, selector) => {
              const elementToReplace =
                document.getElementById(section.id).querySelector(selector) || document.getElementById(section.id);
              elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], selector);
            };
            this.getSectionsToRender().forEach((section) => {
              if (Array.isArray(section.selectors)) {
                section.selectors.filter(Boolean).forEach((selector) => {
                  replaceElement(section, selector);
                });
              } else if (section.selector) {
                replaceElement(section, section.selector);
              }
            });
            this.updateLiveRegions(id, parsedState.item_count);
            this.disableLoading();
          })
          .catch((err) => {
            console.log('catch', err);
            this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.remove('loading'));
            const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
            errors.textContent = window.t('cart.cart_error');
            this.disableLoading();
          });
      }

      updateLiveRegions(id, itemCount) {
        if (this.currentItemCount === itemCount) {
          const lineItemError =
            document.getElementById(`Line-item-error-${id}`) ||
            document.getElementById(`Line-item-error-CartDrawer-${id}`);
          const quantityElement =
            document.getElementById(`Quantity-${id}`) || document.getElementById(`Drawer-quantity-${id}`);
          const cartItemErrorText = lineItemError.querySelector('.cart-item__error-text');
          cartItemErrorText.innerHTML = window.t('cart.cart_quantity_error_html', {
            quantity: quantityElement.value,
          });

          detectingScreen(({ isMobileScreen }) => {
            if (isMobileScreen) {
              cartItemErrorText.classList.remove('display-none-tablet');
            }
          });
          lineItemError.style.marginTop = '10px';
        }

        this.currentItemCount = itemCount;
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
      }

      enableLoading(id) {
        const mainCartItems =
          document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
        mainCartItems.classList.add('cart__items--disabled');

        const cartItemElements = this.querySelectorAll(`.cart-item[data-key="${id}"] .loading-overlay`);

        [...cartItemElements].forEach((overlay) => overlay.classList.add('loading'));
      }

      disableLoading() {
        const mainCartItems =
          document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
        mainCartItems.classList.remove('cart__items--disabled');
      }
    },
);
