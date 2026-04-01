import { supabase } from "../supabase";

import type { FunnelEventInsert } from "../../types/database";

type TrackEventResult = Promise<{
  success: boolean;
  error: string | null;
}>;

function sanitizeMetadata(metadata: FunnelEventInsert["metadata"]) {
  if (!metadata) {
    return null;
  }

  const {
    email,
    phone,
    whatsapp,
    contact_email,
    contact_phone,
    contact_name,
    ...safeMetadata
  } = metadata as Record<string, unknown>;

  void email;
  void phone;
  void whatsapp;
  void contact_email;
  void contact_phone;
  void contact_name;

  return safeMetadata;
}

export async function trackEvent(payload: FunnelEventInsert): TrackEventResult {
  try {
    const { error } = await supabase.from("funnel_events").insert({
      ...payload,
      metadata: sanitizeMetadata(payload.metadata),
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown tracking error",
    };
  }
}
