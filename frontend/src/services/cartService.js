import { api } from "./api";

const CART_KEY = "cart";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
}

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

export function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setLocalCart(items, notify = true) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  if (notify) {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

function normalizeItems(data) {
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchCartItems() {
  if (!hasToken()) {
    return getLocalCart();
  }

  try {
    const res = await api.get("/cart", { headers: getAuthHeaders() });
    const items = normalizeItems(res.data);
    setLocalCart(items, false);
    return items;
  } catch (err) {
    return getLocalCart();
  }
}

export async function addCartItem(book) {
  if (!hasToken()) {
    const items = [...getLocalCart(), book];
    setLocalCart(items);
    return items;
  }

  const res = await api.post("/cart/items", { item: book }, { headers: getAuthHeaders() });
  const items = normalizeItems(res.data);
  setLocalCart(items);
  return items;
}

export async function removeCartItem(index) {
  if (!hasToken()) {
    const items = getLocalCart().filter((_, itemIndex) => itemIndex !== index);
    setLocalCart(items);
    return items;
  }

  const res = await api.delete(`/cart/items/${index}`, { headers: getAuthHeaders() });
  const items = normalizeItems(res.data);
  setLocalCart(items);
  return items;
}

export async function removeFirstCartItemByBookId(book) {
  const bookId = book?._id || book?.id || book?.bookId;
  const items = hasToken() ? await fetchCartItems() : getLocalCart();
  const index = items.findIndex((item) => (item._id || item.id || item.bookId) === bookId);

  if (index === -1) {
    return items;
  }

  return removeCartItem(index);
}

export async function clearCartItems() {
  if (!hasToken()) {
    setLocalCart([]);
    return [];
  }

  const res = await api.delete("/cart", { headers: getAuthHeaders() });
  const items = normalizeItems(res.data);
  setLocalCart(items);
  return items;
}
