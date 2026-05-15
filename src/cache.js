const PFX = 'msc_img_';
export const getImg = k => { try { return sessionStorage.getItem(PFX + k); } catch { return null; } };
export const setImg = (k, v) => {
  try { sessionStorage.setItem(PFX + k, v); } catch {
    try {
      const old = Object.keys(sessionStorage).find(x => x.startsWith(PFX));
      if (old) sessionStorage.removeItem(old);
      sessionStorage.setItem(PFX + k, v);
    } catch {}
  }
};
export const clearImgCache = () => {
  try { Object.keys(sessionStorage).filter(k => k.startsWith(PFX)).forEach(k => sessionStorage.removeItem(k)); } catch {}
};
