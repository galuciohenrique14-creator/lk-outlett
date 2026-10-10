const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_TOKEN_KEY = 'lkoutlet_supabase_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'lkoutlet_supabase_refresh_token';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function hasAdminSession() {
  return isSupabaseConfigured && Boolean(getAdminToken());
}

function saveSession(session) {
  if (!session?.access_token || !session?.refresh_token) {
    throw new Error('O Supabase não retornou uma sessão válida.');
  }
  sessionStorage.setItem(ADMIN_TOKEN_KEY, session.access_token);
  sessionStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, session.refresh_token);
}

function errorMessage(response, payload) {
  return payload?.msg || payload?.message || payload?.error_description || payload?.error || `Erro ${response.status}`;
}

async function request(path, options = {}, authenticated = false) {
  if (!isSupabaseConfigured) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');

  let token = authenticated ? getAdminToken() : null;
  if (authenticated && !token) throw new Error('Faça login no painel para continuar.');

  const makeRequest = () => fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${authenticated ? token : SUPABASE_ANON_KEY}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  let response = await makeRequest();
  if (response.status === 401 && authenticated) {
    const refreshToken = sessionStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    if (refreshToken) {
      const refreshed = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (refreshed.ok) {
        const session = await refreshed.json();
        saveSession(session);
        token = session.access_token;
        response = await makeRequest();
      }
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(errorMessage(response, payload));
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function signInAdmin(email, password) {
  const session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  saveSession(session);
}

export function signOutAdmin() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  sessionStorage.removeItem('lkoutlet_admin_ok');
}

export function fetchSharedProducts() {
  return request('/rest/v1/products?select=id,data&order=id.asc');
}

async function uploadProductImage(dataUrl) {
  const image = await fetch(dataUrl).then((response) => response.blob());
  const path = `${crypto.randomUUID()}.jpg`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${getAdminToken()}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'false'
    },
    body: image
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(errorMessage(response, payload));
  }
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

async function uploadProductImages(product) {
  const images = product.imagens?.length ? product.imagens : [product.imagem].filter(Boolean);
  const storedImages = await Promise.all(images.map((image) =>
    image.startsWith('data:image/') ? uploadProductImage(image) : image
  ));
  return {
    ...product,
    imagem: storedImages[0] || '',
    imagens: storedImages
  };
}

export async function saveSharedProduct(product) {
  const stored = await uploadProductImages(product);
  await request('/rest/v1/products?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify([{ id: stored.id, data: stored }])
  }, true);
  return stored;
}

export async function saveSharedProducts(products) {
  if (!products.length) return [];
  const storedProducts = await Promise.all(products.map(uploadProductImages));
  await request('/rest/v1/products?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(storedProducts.map((product) => ({ id: product.id, data: product })))
  }, true);
  return storedProducts;
}

export function removeSharedProduct(id) {
  return request(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' }
  }, true);
}
