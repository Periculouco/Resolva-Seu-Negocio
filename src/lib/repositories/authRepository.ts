import type { Session } from "@supabase/supabase-js";

import { supabase } from "../supabase";

type RepositorySuccess<T> = {
  success: true;
  data: T;
  error: null;
};

type RepositoryError = {
  success: false;
  data: null;
  error: string;
};

type RepositoryResult<T> = Promise<RepositorySuccess<T> | RepositoryError>;

function buildError(message: string): RepositoryError {
  return {
    success: false,
    data: null,
    error: message,
  };
}

export async function signInPartner(email: string, password: string): RepositoryResult<Session> {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    return buildError("Email and password are required");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.session) {
    return buildError(error?.message ?? "Unable to sign in");
  }

  return {
    success: true,
    data: data.session,
    error: null,
  };
}

export async function signOutPartner(): RepositoryResult<null> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data: null,
    error: null,
  };
}

export async function getCurrentSession(): RepositoryResult<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data: data.session,
    error: null,
  };
}
