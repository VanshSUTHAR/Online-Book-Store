import { api } from "./api";

const CART_KEY = "cart";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
}

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

function getMigrationKey() {
  const userId = localStorage.getItem("userId");
  return userId ? `cartMigrated:${userId}` : "cartMigrated";
}

function hasMigratedLocalCart() {
  return localStorage.getItem(getMigrationKey()) === "true";
}

function markLocalCartMigrated() {
  localStorage.setItem(getMigrationKey(), "true");
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

function getBookId(book) {
  return book?._id || book?.id || book?.bookId;
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
    let items = normalizeItems(res.data);
    const localItems = getLocalCart();

    if (!hasMigratedLocalCart() && items.length === 0 && localItems.length > 0) {
      for (const item of localItems) {
        const addRes = await api.post("/cart/items", { item }, { headers: getAuthHeaders() });
        items = normalizeItems(addRes.data);
      }
    }

    markLocalCartMigrated();
    setLocalCart(items, false);
    return items;
  } catch (err) {
    return getLocalCart();
  }
}

export async function addCartItem(book) {
  if (!hasToken()) {
    const bookId = getBookId(book);
    const items = [...getLocalCart()];
    const existingItem = items.find((item) => getBookId(item) === bookId);

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 1) + Number(book.quantity || 1);
    } else {
      items.push({ ...book, quantity: Number(book.quantity || 1) });
    }

    setLocalCart(items);
    return items;
  }

  const res = await api.post("/cart/items", { item: book }, { headers: getAuthHeaders() });
  const items = normalizeItems(res.data);
  markLocalCartMigrated();
  setLocalCart(items);
  return items;
}

export async function updateCartItemQuantity(index, quantity) {
  const nextQuantity = Math.max(1, Number(quantity || 1));

  if (!hasToken()) {
    const items = getLocalCart().map((item, itemIndex) => (
      itemIndex === index ? { ...item, quantity: nextQuantity } : item
    ));
    setLocalCart(items);
    return items;
  }

  const res = await api.patch(
    `/cart/items/${index}`,
    { quantity: nextQuantity },
    { headers: getAuthHeaders() }
  );
  const items = normalizeItems(res.data);
  markLocalCartMigrated();
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
  markLocalCartMigrated();
  setLocalCart(items);
  return items;
}

export async function removeFirstCartItemByBookId(book) {
  const bookId = getBookId(book);
  const items = hasToken() ? await fetchCartItems() : getLocalCart();
  const index = items.findIndex((item) => getBookId(item) === bookId);

  if (index === -1) {
    return items;
  }

  if (Number(items[index].quantity || 1) > 1) {
    return updateCartItemQuantity(index, Number(items[index].quantity || 1) - 1);
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
  markLocalCartMigrated();
  setLocalCart(items);
  return items;
}
