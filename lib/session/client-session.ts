"use client";

import { LoginResponse } from "@/lib/api/types";
import { AuthUser } from "@/lib/api/types";

type SessionState = {
  user: AuthUser | null;
};

let state: SessionState = { user: null };
const subscribers = new Set<() => void>();

function publish() {
  subscribers.forEach((subscriber) => subscriber());
}

export function subscribeSession(subscriber: () => void) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function getSessionSnapshot() {
  return state;
}

export function setSessionUser(user: AuthUser | null) {
  state = { user };
  publish();
}

export function setSessionFromLogin(payload: LoginResponse) {
  setSessionUser({
    id: payload.id,
    name: payload.name,
    email: payload.email,
  });
}

export function clearSession() {
  state = { user: null };
  publish();
}
