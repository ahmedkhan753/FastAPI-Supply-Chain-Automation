export const PRODUCT_IMAGES = {
    "candy": "https://images.unsplash.com/photo-1582050048266-3d70f0df001b?auto=format&fit=crop&q=80&w=400",
    "snacks": "https://images.unsplash.com/photo-1599490659223-e1539e76926a?auto=format&fit=crop&q=80&w=400",
    "chocolates": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&q=80&w=400",
    "biscuits": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400",
    "cold_drinks": "https://images.unsplash.com/photo-1622483767028-3f66f32caef0?auto=format&fit=crop&q=80&w=400",
    "chewing_gums": "https://images.unsplash.com/photo-1594911772124-d1a7acc2c5ff?auto=format&fit=crop&q=80&w=400",
    "juices": "https://images.unsplash.com/photo-1613478202669-487ca5b7012e?auto=format&fit=crop&q=80&w=400",
    "jelly": "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&q=80&w=400",
    "default": "https://images.unsplash.com/photo-1587049633562-ad35ca2aa0bf?auto=format&fit=crop&q=80&w=400"
};

// Lightweight SVG Data URI as a last-resort fallback (a simple package icon)
export const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgOGwtOS00LTkgNCA5IDQgOS00eiBNMyAxMmw5IDQgOSA0IDkgNG0tOS00djhNMTEuOSA0LjVsLS4xLjEiLz48L3N2Zz4=";

export const getProductImage = (name) => {
    if (!name) return PRODUCT_IMAGES.default;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    return PRODUCT_IMAGES[key] || PRODUCT_IMAGES.default;
};

export const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
        e.target.src = FALLBACK_IMAGE;
    }
    e.target.onerror = null;
};
