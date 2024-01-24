class SentryLoad {
  constructor() {
    this.errList = [];
    this.init();
  }

  init() {
    window.onerror = this.onError;
    window.onload = this.onLoad;
  }

  onError(_m, _s, _l, _c, err) {
    try {
      if (!err) return;
      if (!this.errList) {
        this.errList = [err];
        return;
      }
      if (this.errList.length < 5) {
        this.errList.push(err);
      }
    } catch (error) {
      /* empty */
    }
  }

  onLoad() {
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://browser.sentry-cdn.com/7.51.2/bundle.min.js';
    scriptElement.type = 'text/javascript';
    scriptElement.integrity = 'sha384-TIc4wz4oU9UgbI5Cu7R/6jhJOszkPGImz+Ney9MXZ3MESAGeYJUOV+36KnTacIXP';
    scriptElement.crossOrigin = 'anonymous';
    scriptElement.onload = () => {
      window.Sentry.init({
        dsn: 'https://3349f0e97d144e649485156b6d4f475b@sentry-new.myshopline.com/637',
        release: window.Shopline.themeName,
      });
      const extraData = {
        themeName: window.Shopline.themeName,
        url: window.location.href,
        themeId: window.Shopline.themeId,
        storeId: window.Shopline.storeId,
        themeVersion: window.Shopline.themeVersion,
      };
      window.Sentry.setTags(extraData);
      window.Sentry.setExtras(extraData);
      if (this.errList) {
        this.errList.forEach((err) => {
          window.Sentry.captureException(err);
        });
        this.errList = null;
      }
    };
    document.body.appendChild(scriptElement);
  }
}
new SentryLoad();
