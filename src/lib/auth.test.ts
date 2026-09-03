import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_APP_PASSWORD, getStoredAccessPassword, isPasswordValid, setAccessPassword } from "./auth";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => (values.has(key) ? values.get(key)! : null),
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  } as Storage;
};

test("uses the default password until a real one is saved", () => {
  const previous = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });

  try {
    storage.removeItem("app_access_password");
    assert.equal(getStoredAccessPassword(), DEFAULT_APP_PASSWORD);
    assert.equal(isPasswordValid(DEFAULT_APP_PASSWORD), true);
  } finally {
    if (previous) {
      Object.defineProperty(globalThis, "localStorage", { value: previous, configurable: true, writable: true });
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("stores and validates a changed password", () => {
  const previous = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });

  try {
    setAccessPassword("NewPass@2026");
    assert.equal(getStoredAccessPassword(), "NewPass@2026");
    assert.equal(isPasswordValid("NewPass@2026"), true);
    assert.equal(isPasswordValid(DEFAULT_APP_PASSWORD), false);
    setAccessPassword(DEFAULT_APP_PASSWORD);
  } finally {
    if (previous) {
      Object.defineProperty(globalThis, "localStorage", { value: previous, configurable: true, writable: true });
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});
