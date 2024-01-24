defineCustomElement(
  'infinite-scroll',
  () =>
    class InfiniteScroll extends HTMLElement {
      constructor() {
        super();
        this.page = 1;
        this.observer = null;
        this.loading = false;

        this.init();
      }

      init() {
        this.ensureUrlValid();
        const flag = this.insertFlag();
        const option = {
          threshold: 1,
        };

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (this.isLastPageLoaded) {
              return;
            }

            if (entry.isIntersecting && !this.loading) {
              this.loadMore();
            }
          });
        }, option);

        this.observer.observe(flag);
      }

      reset(params) {
        this.page = 1;
        this.dataset.total = params.total;
        this.dataset.pageSize = params.pageSize;
      }

      get isLastPageLoaded() {
        const { pageSize, total } = this.dataset;
        const currentNum = this.page * pageSize;

        return currentNum >= total;
      }

      insertFlag() {
        const flag = document.createElement('div');
        flag.classList.add('infinite-scroll-flag');
        this.appendChild(flag);
        return flag;
      }

      handleLoading(loading) {
        this.loading = loading;
        const { loadingElementSelector, loadingActiveClass } = this.dataset;
        const ele = this.querySelector(loadingElementSelector);
        if (!ele) {
          return;
        }

        if (loading) {
          ele.classList.add(loadingActiveClass);
        } else {
          ele.classList.remove(loadingActiveClass);
        }
      }

      ensureUrlValid() {
        const url = removeURLArg(window.location.href, ['page_num', 'page_size']);
        window.history.pushState({}, '', url);
      }

      loadMore() {
        const { pageSize, section: sectionId, contentWrapperSelector, loadingElementSelector } = this.dataset;
        const url = changeURLArg(window.location.href, {
          page_num: this.page + 1,
          page_size: pageSize,
          section_id: sectionId,
        });

        this.handleLoading(true);
        fetch(url)
          .then((res) => res.text())
          .then((resText) => {
            const html = new DOMParser().parseFromString(resText, 'text/html');
            const source = html.querySelector(contentWrapperSelector);
            const destination = this.querySelector(contentWrapperSelector);

            if (!source || !destination) {
              return;
            }

            destination.innerHTML += source.innerHTML;

            const currentLoadingElement = this.querySelector(loadingElementSelector);
            const updateLoadingElement = html.querySelector(loadingElementSelector);
            if (currentLoadingElement && updateLoadingElement)
              currentLoadingElement.innerHTML = updateLoadingElement.innerHTML;

            this.page += 1;
            this.handleLoading(false);
          });
      }
    },
);
