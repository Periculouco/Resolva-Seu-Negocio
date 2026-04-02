import { supabase } from "../supabase";

import type { PartnerPlanApplicationInsert, PartnerPlanApplicationRow } from "../../types/database";

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

export async function createPartnerPlanApplication(
  payload: PartnerPlanApplicationInsert,
): RepositoryResult<PartnerPlanApplicationRow | null> {
  try {
    const { error } = await supabase
      .from("partner_plan_applications")
      .insert({
        ...payload,
        partner_portfolio_url: payload.partner_portfolio_url ?? null,
        source_screen: payload.source_screen ?? "partner_pitch",
        status: payload.status ?? "Novo",
      });

    if (error) {
      return {
        success: false,
        data: null,
        error: error?.message ?? "Não foi possível registrar o interesse do parceiro.",
      };
    }

    return {
      success: true,
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Erro desconhecido ao registrar parceiro.",
    };
  }
}
