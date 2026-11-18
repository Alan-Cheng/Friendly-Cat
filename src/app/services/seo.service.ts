import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

// Global gtag type declaration
declare global {
  function gtag(...args: any[]): void;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private meta: Meta,
    private title: Title
  ) { }

  /**
   * Set page title
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * Set meta description
   */
  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  /**
   * Set meta keywords
   */
  setKeywords(keywords: string): void {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Set Open Graph tags
   */
  setOpenGraphTags(data: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    if (data.title) {
      this.meta.updateTag({ property: 'og:title', content: data.title });
      this.meta.updateTag({ name: 'twitter:title', content: data.title });
    }
    if (data.description) {
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }
    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
      this.meta.updateTag({ name: 'twitter:url', content: data.url });
    }
    if (data.type) {
      this.meta.updateTag({ property: 'og:type', content: data.type });
    }
  }

  /**
   * Set canonical URL
   */
  setCanonicalUrl(url: string): void {
    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Set structured data
   */
  setStructuredData(data: any): void {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent && script.textContent.includes('"@type":"WebPage"')) {
        script.remove();
      }
    });

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Set search page SEO
   */
  setSearchPageSEO(): void {
    this.setTitle('友善時光查詢 - 友善黑貓 Friendly Cat');
    this.setDescription('查詢附近超商的友善時光商品，包括全家、7-11等便利商店的剩食優惠資訊。省錢又環保，讓您輕鬆找到優惠商品。');
    this.setKeywords('友善時光查詢,超商剩食,全家便利商店,7-11,便利商店優惠,省錢,環保');
    
    this.setOpenGraphTags({
      title: '友善時光查詢 - 友善黑貓 Friendly Cat',
      description: '查詢附近超商的友善時光商品，包括全家、7-11等便利商店的剩食優惠資訊。省錢又環保，讓您輕鬆找到優惠商品。',
      url: 'https://friendlycat.app/search',
      type: 'website'
    });

    this.setStructuredData({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "友善時光查詢",
      "description": "查詢附近超商的友善時光商品，包括全家、7-11等便利商店的剩食優惠資訊",
      "url": "https://friendlycat.app/search",
      "mainEntity": {
        "@type": "SearchAction",
        "target": "https://friendlycat.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
  }

  /**
   * Set store page SEO
   */
  setStorePageSEO(storeName?: string): void {
    const title = storeName ? `${storeName} - 友善黑貓 Friendly Cat` : '便利商店資訊 - 友善黑貓 Friendly Cat';
    const description = storeName 
      ? `查看${storeName}的友善時光商品資訊，包括商品價格、庫存狀況等詳細資訊。`
      : '查看便利商店的友善時光商品資訊，包括商品價格、庫存狀況等詳細資訊。';

    this.setTitle(title);
    this.setDescription(description);
    this.setKeywords(`${storeName || '便利商店'},友善時光,商品資訊,價格查詢,庫存狀況`);

    this.setOpenGraphTags({
      title,
      description,
      url: 'https://friendlycat.app/store',
      type: 'website'
    });
  }

  /**
   * Set chatbot page SEO
   */
  setChatbotPageSEO(): void {
    this.setTitle('AI 助手 - 友善黑貓 Friendly Cat');
    this.setDescription('友善黑貓AI助手，為您提供友善時光查詢、商品推薦等智能服務。讓您的購物體驗更加便捷。');
    this.setKeywords('AI助手,智能客服,友善時光,商品推薦,智能服務');

    this.setOpenGraphTags({
      title: 'AI 助手 - 友善黑貓 Friendly Cat',
      description: '友善黑貓AI助手，為您提供友善時光查詢、商品推薦等智能服務。讓您的購物體驗更加便捷。',
      url: 'https://friendlycat.app/chatbot',
      type: 'website'
    });
  }

  /**
   * Track page view for analytics
   */
  trackPageView(pageTitle: string, pagePath: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-JQYB557GH5', {
        'page_title': pageTitle,
        'page_path': pagePath,
        'custom_map': {
          'dimension1': 'user_type'
        }
      });
    }
  }
} 