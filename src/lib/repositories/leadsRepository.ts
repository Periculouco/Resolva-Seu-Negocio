import { supabase } from "../supabase";

import type { LeadInsert, LeadRow, LeadStatus } from "../../types/database";

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

/** Insert público não usa `.select()` porque RLS de `leads` não permite SELECT para `anon` na linha inserida. */
export type CreateLeadData = {
  id: null;
};

function normalizeInstanceSlug(instanceSlug: string) {
  return instanceSlug.trim();
}

function buildError(message: string): RepositoryError {
  return {
    success: false,
    data: null,
    error: message,
  };
}

export async function createLead(payload: LeadInsert): RepositoryResult<CreateLeadData> {
  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data: { id: null },
    error: null,
  };
}

export async function listLeadsByInstance(instanceSlug: string): RepositoryResult<LeadRow[]> {
  const normalizedInstanceSlug = normalizeInstanceSlug(instanceSlug);

  if (!normalizedInstanceSlug) {
    return buildError("instanceSlug is required");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("partner_instance_slug", normalizedInstanceSlug)
    .order("created_at", { ascending: false })
    .returns<LeadRow[]>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  instanceSlug: string,
): RepositoryResult<LeadRow> {
  const normalizedInstanceSlug = normalizeInstanceSlug(instanceSlug);

  if (!normalizedInstanceSlug) {
    return buildError("instanceSlug is required");
  }

  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("partner_instance_slug", normalizedInstanceSlug)
    .select("*")
    .single<LeadRow>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}
