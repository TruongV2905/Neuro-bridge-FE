// modules/jobpost/configs/jobpost-draft-storage.config.ts

import type { CreateJobpostWizardState } from "../types/create-jobpost-wizard.type"

export const JOBPOST_DRAFT_STORAGE_KEY = "neuro-bridge:create-jobpost-draft"

export function saveJobpostDraft(state: CreateJobpostWizardState) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(JOBPOST_DRAFT_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Failed to save jobpost draft:", error)
  }
}

export function loadJobpostDraft(): CreateJobpostWizardState | null {
  if (typeof window === "undefined") return null

  try {
    const draft = localStorage.getItem(JOBPOST_DRAFT_STORAGE_KEY)

    if (!draft) {
      return null
    }

    return JSON.parse(draft) as CreateJobpostWizardState
  } catch (error) {
    console.error("Failed to load jobpost draft:", error)
    return null
  }
}

export function clearJobpostDraft() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(JOBPOST_DRAFT_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear jobpost draft:", error)
  }
}