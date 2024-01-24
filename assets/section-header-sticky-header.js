defineCustomElement(
  'sticky-header',
  () =>
    class StickyHeader extends HTMLElement {
      connectedCallback() {
        this.header = document.getElementById('shopline-section-header');
        this.headerBounds = {};
        this.currentScrollTop = 0;
        this.preventReveal = false;
        this.predictiveSearch = this.querySelector('predictive-search');
        // always or on-scroll-up
        const headerStickyType = this.getAttribute('data-sticky-type');

        this.onScrollHandler =
          headerStickyType === 'always' ? this.onScrollAlways.bind(this) : this.onScrollUp.bind(this);
        this.hideHeaderOnScrollUp = () => {
          this.preventReveal = true;
        };

        this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
        window.addEventListener('scroll', this.onScrollHandler, false);

        this.createObserver();
      }

      disconnectedCallback() {
        this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
        window.removeEventListener('scroll', this.onScrollHandler);
      }

      createObserver() {
        const observer = new IntersectionObserver((entries, absr) => {
          this.headerBounds = entries[0].intersectionRect;
          absr.disconnect();
        });

        observer.observe(this.header);
      }

      onScrollUp() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

        if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
          if (this.preventHide) return;
          requestAnimationFrame(this.hide.bind(this));
        } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
          if (!this.preventReveal) {
            requestAnimationFrame(this.reveal.bind(this));
          } else {
            window.clearTimeout(this.isScrolling);
            // Header display is not triggered within 66ms
            this.isScrolling = setTimeout(() => {
              this.preventReveal = false;
            }, 66);

            requestAnimationFrame(this.hide.bind(this));
          }
        } else if (scrollTop <= this.headerBounds.top) {
          requestAnimationFrame(this.reset.bind(this));
        }

        this.currentScrollTop = scrollTop;
      }

      onScrollAlways() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (this.predictiveSearch && this.predictiveSearch.isOpen) return;
        if (scrollTop > 250) {
          requestAnimationFrame(this.addStickyClass.bind(this));
        }
        if (scrollTop === 0) {
          requestAnimationFrame(this.removeSticyClass.bind(this));
        }
      }

      hide() {
        this.header.classList.add('shopline-section-header-hidden', 'shopline-section-header-sticky');
      }

      reveal() {
        this.header.classList.add('shopline-section-header-sticky', 'animate');
        this.header.classList.remove('shopline-section-header-hidden');
      }

      reset() {
        this.header.classList.remove('shopline-section-header-hidden', 'shopline-section-header-sticky', 'animate');
      }

      addStickyClass() {
        this.header.classList.add('shopline-section-header-sticky--always');
      }

      removeSticyClass() {
        this.header.classList.remove('shopline-section-header-sticky--always');
      }
    },
);
