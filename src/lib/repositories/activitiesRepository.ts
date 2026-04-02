import { supabase } from "../supabase";

import type { PartnerActivityInsert, PartnerActivityRow } from "../../types/database";

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

export async function createActivity(payload: PartnerActivityInsert): RepositoryResult<PartnerActivityRow> {
  const normalizedInstanceSlug = normalizeInstanceSlug(payload.partner_instance_slug);

  if (!normalizedInstanceSlug) {
    return buildError("instanceSlug is required");
  }

  const { data, error } = await supabase
    .from("partner_activities")
    .insert({
      ...payload,
      partner_instance_slug: normalizedInstanceSlug,
      status: payload.status ?? "Pendente",
    })
    .select("*")
    .single<PartnerActivityRow>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}

export async function listActivitiesByLead(
  leadId: string,
  instanceSlug: string,
): RepositoryResult<PartnerActivityRow[]> {
  const normalizedInstanceSlug = normalizeInstanceSlug(instanceSlug);

  if (!normalizedInstanceSlug) {
    return buildError("instanceSlug is required");
  }

  if (!leadId.trim()) {
    return buildError("leadId is required");
  }

  const { data, error } = await supabase
    .from("partner_activities")
    .select("*")
    .eq("partner_instance_slug", normalizedInstanceSlug)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .returns<PartnerActivityRow[]>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}
