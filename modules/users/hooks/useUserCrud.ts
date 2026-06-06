"use client"

import { createElement, useCallback, useEffect, useMemo, useState } from "react"
import { Ban, CheckCircle2, RotateCcw } from "lucide-react"

import { userService } from "@/services/user.service"
import type { TableAction } from "@/components/dashboard/table/DataTable"
import {
  UserGender,
  UserRole,
  UserStatus,
  type User,
  type UserFilterRequest,
  type UserSortDirection,
} from "@/types/user/user.type"

export type CrudSortDirection = "asc" | "desc"

export type UseUserCrudParams = {
  page: number
  size: number
  search: string
  sortKey: string | null
  sortDirection: CrudSortDirection | null
  filters: Record<string, string>
}

type UserCrudState = {
  data: User[]
  totalItems: number
  totalPages: number
  error: string | null
  completedRequestId: string
}

const mapSortKeyToApi = (sortKey: string | null) => {
  if (!sortKey) return "createdAt"

  if (sortKey === "user") return "fullName"

  return sortKey
}

const mapSortDirectionToApi = (
  sortDirection: CrudSortDirection | null,
): UserSortDirection => {
  return sortDirection === "desc" ? "DESCENDING" : "ASCENDING"
}

const removeEmptyFilterValues = (
  filter: UserFilterRequest["filter"],
): UserFilterRequest["filter"] => {
  if (!filter) return undefined

  const cleanedFilter = Object.fromEntries(
    Object.entries(filter).filter(([, value]) => {
      return value !== undefined && value !== null && value !== ""
    }),
  ) as UserFilterRequest["filter"]

  if (Object.keys(cleanedFilter ?? {}).length === 0) {
    return undefined
  }

  return cleanedFilter
}

export function useUserCrud({
  page,
  size,
  search,
  sortKey,
  sortDirection,
  filters,
}: UseUserCrudParams) {
  const [refreshVersion, setRefreshVersion] = useState(0)

  const [state, setState] = useState<UserCrudState>({
    data: [],
    totalItems: 0,
    totalPages: 1,
    error: null,
    completedRequestId: "",
  })

  const payload = useMemo<UserFilterRequest>(() => {
    return {
      page: page - 1,
      size,
      sortBy: mapSortKeyToApi(sortKey),
      direction: mapSortDirectionToApi(sortDirection),
      search: search.trim() || undefined,
      filter: removeEmptyFilterValues({
        role: filters.role as UserRole | undefined,
        status: filters.status as UserStatus | undefined,
        gender: filters.gender as UserGender | undefined,
        address: filters.address || undefined,
      }),
    }
  }, [page, size, search, sortKey, sortDirection, filters])

  const requestKey = useMemo(() => {
    return JSON.stringify(payload)
  }, [payload])

  const requestId = useMemo(() => {
    return `${requestKey}:${refreshVersion}`
  }, [requestKey, refreshVersion])

  const loading = state.completedRequestId !== requestId

  useEffect(() => {
    let ignore = false

    userService
      .filterUsers(payload)
      .then((response) => {
        if (ignore) return

        const metadata = response.result.metadata

        setState({
          data: response.result.data,
          totalItems: metadata.totalElements,
          totalPages: Math.max(metadata.totalPages, 1),
          error: null,
          completedRequestId: requestId,
        })
      })
      .catch((err) => {
        if (ignore) return

        setState({
          data: [],
          totalItems: 0,
          totalPages: 1,
          error: err instanceof Error ? err.message : "Failed to load users",
          completedRequestId: requestId,
        })
      })

    return () => {
      ignore = true
    }
  }, [payload, requestId])

  const refresh = useCallback(() => {
    setRefreshVersion((current) => current + 1)
  }, [])

  const changeUserStatus = useCallback(
    async (user: User, status: UserStatus) => {
      await userService.updateUserStatus(user.code, status)
      setRefreshVersion((current) => current + 1)
    },
    [],
  )

  const customActions = useMemo<TableAction<User>[]>(() => {
    return [
      {
        id: "activate-user",
        type: "custom",
        label: "Set active",
        icon: createElement(CheckCircle2, { className: "h-4 w-4" }),
        onClick: async (row) => {
          if (row.status === UserStatus.ACTIVE) return

          const confirmed = window.confirm(
            "Are you sure you want to set this user as active?",
          )

          if (!confirmed) return

          await changeUserStatus(row, UserStatus.ACTIVE)
        },
      },
      {
        id: "inactive-user",
        type: "custom",
        label: "Set inactive",
        icon: createElement(RotateCcw, { className: "h-4 w-4" }),
        onClick: async (row) => {
          if (row.status === UserStatus.INACTIVE) return

          const confirmed = window.confirm(
            "Are you sure you want to set this user as inactive?",
          )

          if (!confirmed) return

          await changeUserStatus(row, UserStatus.INACTIVE)
        },
      },
      {
        id: "ban-user",
        type: "custom",
        label: "Ban user",
        icon: createElement(Ban, { className: "h-4 w-4" }),
        variant: "destructive",
        onClick: async (row) => {
          if (row.status === UserStatus.BANNED) return

          const confirmed = window.confirm(
            "Are you sure you want to ban this user?",
          )

          if (!confirmed) return

          await changeUserStatus(row, UserStatus.BANNED)
        },
      },
    ]
  }, [changeUserStatus])

  return {
    data: state.data,
    totalItems: state.totalItems,
    totalPages: state.totalPages,
    loading,
    error: state.error,
    refresh,

    getRowKey: (row: User) => row.id,

    customActions,
  }
}