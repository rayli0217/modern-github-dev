defineCustomElement(
  'featured-collection-tabs',
  () =>
    class FeaturedCollectionTabs extends HTMLElement {
      constructor() {
        super();

        const tabs = this.querySelector('.featured-collection__tabs');
        const tabList = this.querySelectorAll('.featured-collection__tabs-item');

        // Overflow scroll
        detectingScreen(({ isMobileScreen }) => {
          if (isMobileScreen) {
            if (tabs.scrollWidth > tabs.clientWidth) {
              tabs.classList.add('flex-start');
            } else {
              tabs.classList.remove('flex-start');
            }
          }
        }, true);
        const toggle = (id, bl) => {
          const listDom = this.querySelectorAll(`.slider-block--${id}`);
          listDom.forEach((item) => {
            if (bl) {
              item.classList.remove('display-none');
            } else {
              item.classList.add('display-none');
            }
          });
        };

        tabs.addEventListener('click', (ev) => {
          const dom = ev.target;
          const { id } = dom.dataset;

          if (!id) return;

          tabList.forEach((tab) => {
            if (tab.dataset.id === id) {
              tab.classList.add('featured-collection__tabs-item--active');
              tabs.scrollTo({ left: tab.offsetLeft - tab.clientWidth, behavior: 'smooth' });
            } else {
              tab.classList.remove('featured-collection__tabs-item--active');
            }
            toggle(tab.dataset.id, tab.dataset.id === id);
          });
        });
      }
    },
);
