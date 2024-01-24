defineCustomElement(
  'announcement-bar-section',
  () =>
    class AnnouncementBarSection extends SliderComponent {
      constructor() {
        super();
        this.enableSliderLooping = true;
        this.addEventListener('visible', this.init.bind(this));
        this.addEventListener('slideChanged', this.slideChange.bind(this));
      }

      init() {
        // Bind page number click event
        this.sliderControlLinksArray = Array.from(this.querySelectorAll('.slider-counter__link'));
        this.sliderControlLinksArray.forEach((controlLink) =>
          controlLink.addEventListener('click', this.linkToSlide.bind(this)),
        );

        this.initSliderHeight();
        this.bindResize();
        this.slideChange();
        this.setAutoPlay();
      }

      linkToSlide(event) {
        event.preventDefault();
        this.slideTo(this.sliderControlLinksArray.indexOf(event.currentTarget) + 1);
      }

      slideChange() {
        if (this.sliderControlLinksArray.length) {
          const ACTIVE_CLASS = 'slider-counter__link--active';
          this.sliderControlLinksArray.forEach((link) => link.classList.remove(ACTIVE_CLASS));
          this.sliderControlLinksArray[this.currentPage - 1].classList.add(ACTIVE_CLASS);
        }

        // Restart Autoplay
        this.play();
      }

      initSliderHeight() {
        if (this.direction !== 'vertical') {
          return;
        }

        this.resetSliderHeight();

        let max = 0;
        this.slideItems.forEach((item) => {
          const height = item.clientHeight;
          max = max > height ? max : height;
        });
        if (max === 0) {
          return;
        }

        this.setSliderHeight(max);
      }

      resetSliderHeight() {
        this.slider.style.height = 'auto';
        this.slideItems.forEach((item) => {
          item.style.height = 'auto';
        });
      }

      setSliderHeight(h) {
        this.slider.style.height = `${h}px`;
        this.slideItems.forEach((item) => {
          item.style.height = '100%';
        });
      }

      bindResize() {
        if (this.direction !== 'vertical') {
          return;
        }

        const debounceSetHeight = debounce(() => this.initSliderHeight(), 500);
        window.addEventListener('resize', debounceSetHeight);
      }

      setAutoPlay() {
        this.autoPlaySpeed = 5 * 1000;
        this.play();
      }

      play() {
        if (!this.autoPlaySpeed) return;
        clearInterval(this._autoPlayTimer);
        this._autoPlayTimer = setInterval(() => {
          const targetPage = (this.currentPage + 1) % this.totalPage || this.totalPage;
          this.slideTo(targetPage);
        }, this.autoPlaySpeed);
      }

      pause() {
        clearInterval(this.autoplay);
      }
    },
);
