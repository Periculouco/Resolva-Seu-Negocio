import { supabase } from "../supabase";

import type { PartnerAgendaRow } from "../../types/database";

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

function normalizeInstanceSlug(instanceSlug: string) {
  return instanceSlug.trim();
}

export async function listAgendaByInstance(instanceSlug: string): RepositoryResult<PartnerAgendaRow[]> {
  const normalizedInstanceSlug = normalizeInstanceSlug(instanceSlug);

  if (!normalizedInstanceSlug) {
    return buildError("instanceSlug is required");
  }

  const { data, error } = await supabase
    .from("partner_agenda")
    .select("*")
    .eq("partner_instance_slug", normalizedInstanceSlug)
    .order("starts_at", { ascending: true })
    .returns<PartnerAgendaRow[]>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}
