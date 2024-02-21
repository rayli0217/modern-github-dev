defineCustomElement('media-gallery', () => {
  return class MediaGallery extends HTMLElement {
    constructor() {
      super();

      this.elements = {
        liveRegion: this.querySelector('[id^="GalleryStatus"]'),
        viewer: this.querySelector('[id^="GalleryViewer"]'),
        thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
      };
      this.mql = window.matchMedia('(min-width: 750px)');
      this.mediaVideoAutoPlay = this.getAttribute('data-video-autoplay') === 'true';
      this.paginationType = this.getAttribute('data-pagination-type');
      this.handleVideoAutoPlay();
      this.handleViewController();

      if (!this.elements.thumbnails) return;

      this.elements.viewer.addEventListener('slideChanged', window.debounce(this.onSlideChanged.bind(this), 500));
      this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
        mediaToSwitch
          .querySelector('button')
          .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
      });
    }

    onSlideChanged(event) {
      const thumbnail = this.elements.thumbnails.querySelector(
        `[data-target="${event.detail.currentElement.dataset.mediaId}"]`,
      );
      this.setActiveThumbnail(thumbnail);
    }

    handleViewController() {
      const mobileQl = window.matchMedia('(max-width: 959px)');

      if (this.elements.thumbnails || !mobileQl.matches) return;

      const onSlideChanged = (currentPage = 1) => {
        const { totalPage } = this.elements.viewer;

        if (!totalPage || !currentPage) return;

        if (this.paginationType === 'progress') {
          const progressElement = this.querySelector('.product-pagination__progress');
          const widthPercent = ((currentPage / totalPage) * 100).toFixed(3);

          progressElement.style.setProperty('--progress-percent', `${widthPercent}%`);
        } else if (this.paginationType === 'dot' || this.paginationType === 'slider-bar') {
          const dotElements = this.querySelectorAll('.product-pagination__dot-slider .tap-area');

          dotElements.forEach((element, index) => {
            element.removeAttribute('data-current');

            if (index === currentPage - 1) {
              element.setAttribute('data-current', true);
            }
          });
        }
      };

      onSlideChanged(this.elements.viewer.currentPage);

      this.elements.viewer.addEventListener('slideChanged', (event) => {
        const { currentPage } = event.detail;

        onSlideChanged(currentPage);
      });
    }

    setActiveMedia(mediaId, prepend) {
      const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
      const activeMediaIndex = Array.from(activeMedia.parentElement.children).indexOf(activeMedia);

      if (activeMediaIndex > -1) {
        this.elements.viewer.currentPage = activeMediaIndex + 1;
        this.elements.viewer.updateView();
      }

      if (prepend) {
        activeMedia.parentElement.prepend(activeMedia);
        if (this.elements.thumbnails) {
          const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
          activeThumbnail.parentElement.prepend(activeThumbnail);
        }
        if (this.elements.viewer.slider) {
          this.elements.viewer.resetSlides();
          this.elements.viewer.slideTo(1);
        }
      }

      window.setTimeout(() => {
        if (this.elements.thumbnails) {
          activeMedia.parentElement.scrollTo({
            left: activeMedia.offsetLeft,
          });
        }
        if (!this.elements.thumbnails || this.dataset.desktopLayout === 'flatten') {
          const headerLayout = document.body.querySelector('header-layout');
          window.scrollTo({
            top:
              window.scrollY +
              activeMedia.getBoundingClientRect().top -
              (headerLayout.isSticky ? headerLayout.headerLayout.clientHeight : 0),
            behavior: 'smooth',
          });
        }
      });
      this.playActiveMedia(activeMedia);

      if (!this.elements.thumbnails) return;
      const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
      this.setActiveThumbnail(activeThumbnail);
      this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
    }

    setActiveThumbnail(thumbnail) {
      if (!this.elements.thumbnails || !thumbnail) return;

      this.elements.thumbnails.querySelectorAll('button').forEach((element) => element.removeAttribute('data-current'));
      thumbnail.querySelector('button').setAttribute('data-current', true);

      if (this.elements.thumbnails.isSlideVisible(thumbnail)) return;

      this.elements.thumbnails.slider.scrollTo(
        this.elements.thumbnails.direction === 'vertical'
          ? { top: thumbnail.offsetTop }
          : { left: thumbnail.offsetLeft },
      );
    }

    announceLiveRegion(activeItem) {
      const image = activeItem.querySelector('.product__modal-opener--image img');
      if (!image) return;
      image.onload = () => {
        this.elements.liveRegion.setAttribute('data-hidden', false);
        // this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
        setTimeout(() => {
          this.elements.liveRegion.setAttribute('data-hidden', true);
        }, 2000);
      };
      // image.src = image.src;
    }

    playActiveMedia(activeItem) {
      if (!this.mediaVideoAutoPlay) return;
      window.pauseAllMedia();
      const deferredMedia = activeItem.querySelector('.deferred-media');
      if (deferredMedia) {
        deferredMedia.loadContent(false);
        deferredMedia.playVideo(false);
      }
    }

    handleVideoAutoPlay() {
      const container = document.querySelector(this.getAttribute('data-parent-container'));

      const isInViewPort = (element) => {
        if (container) {
          const cRect = container.getBoundingClientRect();
          const eRect = element.getBoundingClientRect();

          return eRect.height > 0 && eRect.width > 0 && eRect.bottom <= cRect.bottom && eRect.right <= cRect.right;
        }

        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const { top, right, bottom, width, height } = element.getBoundingClientRect();

        return width > 0 && height > 0 && top >= 0 && right <= viewWidth && bottom <= viewHeight;
      };

      const checkDeferredMedia = () => {
        if (this.mediaVideoAutoPlay) {
          const medias = this.elements.viewer.querySelectorAll('.deferred-media');

          medias.forEach((el) => {
            if (isInViewPort(el)) {
              el.loadContent(false);
            }
          });
        }
      };

      setTimeout(() => {
        checkDeferredMedia();
      }, 200);
      (container || window).addEventListener('scroll', checkDeferredMedia);
      this.elements.viewer.addEventListener('slideChanged', checkDeferredMedia);
    }
  };
});
