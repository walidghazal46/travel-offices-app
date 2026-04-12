// recaptcha.service.js - Firebase RecaptchaVerifier Service
import { RecaptchaVerifier, getAuth } from 'firebase/auth';
import { firebaseAuth } from './firebase';

class FirebaseRecaptchaService {
  constructor() {
    this.verifier = null;
    this.containerId = null;
    this.isInitialized = false;
    this.isRendering = false;
  }

  async init(containerId, options = {}) {
    console.log('Initializing RecaptchaService for container:', containerId);

    // منع التهيئة المتعددة
    if (this.isRendering) {
      console.log('Already initializing, waiting...');
      return this.verifier;
    }

    this.isRendering = true;

    try {
      // تنظيف كامل قبل أي إنشاء جديد
      this.destroy();

      this.containerId = containerId;

      // التأكد من وجود العنصر في DOM
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container element with id '${containerId}' not found`);
      }

      // انتظار تحميل grecaptcha إذا لم يكن متوفراً
      if (typeof grecaptcha === 'undefined') {
        console.log('Waiting for grecaptcha to load...');
        await new Promise((resolve) => {
          const checkGrecaptcha = () => {
            if (typeof grecaptcha !== 'undefined') {
              console.log('grecaptcha loaded');
              resolve();
            } else {
              setTimeout(checkGrecaptcha, 100);
            }
          };
          checkGrecaptcha();
        });
      }

      // التأكد من أن Firebase Auth جاهز
      console.log('Checking Firebase Auth...');
      const authInstance = firebaseAuth || getAuth();
      if (!authInstance) {
        throw new Error('Firebase Auth not initialized');
      }

      console.log('Firebase Auth ready, creating RecaptchaVerifier...');

      this.verifier = new RecaptchaVerifier(authInstance, containerId, {
        size: options.size || 'normal',
        callback: options.callback || (() => {}),
        'expired-callback': options.expiredCallback || (() => this.reset()),
        'error-callback': options.errorCallback || (() => this.reset()),
      });

      this.isInitialized = true;
      return this.verifier;
    } finally {
      this.isRendering = false;
    }
  }

  reset() {
    if (this.verifier) {
      try {
        this.verifier.clear();
      } catch (error) {
        console.warn('Error clearing recaptcha:', error);
      }
      this.verifier = null;
    }

    this.isInitialized = false;

    // تنظيف العنصر DOM
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }

  destroy() {
    this.reset();
    this.containerId = null;
  }

  async render() {
    console.log('Rendering recaptcha, verifier:', this.verifier);

    if (!this.verifier) {
      throw new Error('Verifier not initialized. Call init() first.');
    }

    try {
      console.log('Calling verifier.render()...');
      const widgetId = await this.verifier.render();
      console.log('Recaptcha rendered with widgetId:', widgetId);
      return widgetId;
    } catch (error) {
      console.error('Error rendering recaptcha:', error);
      throw error;
    }
  }

  getVerifier() {
    return this.verifier;
  }

  isReady() {
    return this.isInitialized && this.verifier !== null;
  }
}

export default new FirebaseRecaptchaService();