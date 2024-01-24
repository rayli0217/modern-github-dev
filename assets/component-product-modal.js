defineCustomElement(
  'product-modal',
  () =>
    class ProductModal extends ModalDialog {
      close() {
        super.close();
      }

      open(opener) {
        super.open(opener);
        this.showActiveMedia();
      }

      showActiveMedia() {
        this.querySelectorAll(
          `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute('data-media-id')}"])`,
        ).forEach((element) => {
          element.classList.remove('active');
        });

        const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`);
        activeMedia.classList.add('active');
        activeMedia.scrollIntoView();

        const container = this.querySelector('[role="document"]');
        container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

        if (activeMedia.nodeName === 'DEFERRED-MEDIA') {
          activeMedia.loadContent();
          activeMedia.playVideo();
        }
      }
    },
);
