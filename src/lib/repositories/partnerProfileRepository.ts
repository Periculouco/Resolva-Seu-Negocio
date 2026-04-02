import { supabase } from "../supabase";

import type { PartnerProfileRow } from "../../types/database";

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

export async function getCurrentPartnerProfile(): RepositoryResult<PartnerProfileRow | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return buildError(userError.message);
  }

  if (!user) {
    return {
      success: true,
      data: null,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("partner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<PartnerProfileRow>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}

export async function updateCurrentPartnerPipelineName(
  pipelineName: string,
): RepositoryResult<PartnerProfileRow> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return buildError(userError.message);
  }

  if (!user) {
    return buildError("Usuário não autenticado.");
  }

  const normalizedPipelineName = pipelineName.trim();

  if (!normalizedPipelineName) {
    return buildError("pipelineName is required");
  }

  const { data, error } = await supabase
    .from("partner_profiles")
    .update({
      pipeline_name: normalizedPipelineName,
    })
    .eq("user_id", user.id)
    .select("*")
    .single<PartnerProfileRow>();

  if (error) {
    return buildError(error.message);
  }

  return {
    success: true,
    data,
    error: null,
  };
}
