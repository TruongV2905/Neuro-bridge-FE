import { createMutationHook, createQueryHook } from "@/hooks/userAPI"
import {
  PortfolioForExpertRequest,
  PortfolioRequest,
  PortfolioResponse,
} from "@/types/portfolio.types"

const PORTFOLIO_ENDPOINT = "/identity/portfolio"

const portfolioKeys = {
  all: ["portfolios"],
  list: ["portfolios", "list"],
  detail: ["portfolios", "detail"],
  expert: ["portfolios", "expert"],
}

export const useGetPortfolios = createQueryHook<PortfolioResponse[]>(
  portfolioKeys.list,
  PORTFOLIO_ENDPOINT,
)

export const useGetPortfoliosByExpertCode = createQueryHook<
  PortfolioResponse[]
>(
  portfolioKeys.expert,
  `${PORTFOLIO_ENDPOINT}/expert/:code`,
)

export const useGetPortfolioById = createQueryHook<PortfolioResponse>(
  portfolioKeys.detail,
  `${PORTFOLIO_ENDPOINT}/:id`,
)

export const useCreatePortfolio = createMutationHook<
  PortfolioResponse,
  PortfolioRequest
>({
  url: PORTFOLIO_ENDPOINT,
  method: "POST",
  queryKeyToInvalidate: [portfolioKeys.list, portfolioKeys.expert],
})

export const useUpdatePortfolio = createMutationHook<
  PortfolioResponse,
  PortfolioRequest
>({
  url: `${PORTFOLIO_ENDPOINT}/:id`,
  method: "PUT",
  queryKeyToInvalidate: [
    portfolioKeys.list,
    portfolioKeys.detail,
    portfolioKeys.expert,
  ],
})

export const useDeletePortfolio = createMutationHook<PortfolioResponse, void>({
  url: `${PORTFOLIO_ENDPOINT}/:id`,
  method: "DELETE",
  queryKeyToInvalidate: [portfolioKeys.list, portfolioKeys.expert],
})

export const useAssignPortfoliosToExpert = createMutationHook<
  void,
  PortfolioForExpertRequest
>({
  url: `${PORTFOLIO_ENDPOINT}/expert/:code`,
  method: "PUT",
  queryKeyToInvalidate: [portfolioKeys.expert],
})