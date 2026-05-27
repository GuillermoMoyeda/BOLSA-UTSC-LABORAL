const loaded = new Set<string>();
const baseBodyClasses: string[] = ['login-page', 'fade-in', 'cv-page-bg', 'bg-erp'];

export function setBodyClasses(classes: string[] = []) {
  baseBodyClasses.forEach(c => document.body.classList.remove(c));
  classes.forEach(c => document.body.classList.add(c));
}

export function applyPageStyles(hrefs: string[]) {
  const existing = document.querySelectorAll('link[data-page-style]');
  existing.forEach(el => el.remove());

  hrefs.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-page-style', 'true');
    document.head.appendChild(link);
  });
}

export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loaded.has(src)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => {
      loaded.add(src);
      resolve();
    };
    script.onerror = (err) => {
      reject(err);
    };
    document.body.appendChild(script);
  });
}

export async function loadScriptsSequential(scripts: string[]): Promise<void> {
  for (const src of scripts) {
    await loadScript(src);
  }
}

export function triggerDomReady() {
  document.dispatchEvent(new Event('DOMContentLoaded'));
}
