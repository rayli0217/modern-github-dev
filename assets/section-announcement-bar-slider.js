defineCustomElement(
  'announcement-bar-slider',
  () =>
    class AnnouncementBarSlider extends HTMLElement {
      constructor() {
        super();

        this.itemHeight = this.querySelector('.announcement-bar--item').offsetHeight;
        this.displayMode = this.dataset.displayMode;

        this.initSlider();
      }

      initSlider() {
        if (!window.Splide) return;
        const direction = this.displayMode === '4' ? 'ttb' : 'ltr';
        const resetOptions =
          this.displayMode === '2'
            ? {
                mediaQuery: 'min',
                breakpoints: {
                  959: {
                    destroy: true,
                  },
                },
              }
            : {};
        const splide = new window.Splide(this.querySelector('.splide'), {
          type: 'loop',
          pagination: false,
          perPage: 1,
          arrows: false,
          autoplay: true,
          interval: 5000,
          height: `${this.itemHeight}px`,
          direction,
          ...resetOptions,
        });
        splide.mount();
      }

      disconnectedCallback() {}
    },
);
