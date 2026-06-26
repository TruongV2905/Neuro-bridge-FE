import type { PaymentStatus, PaymentStatusContent } from "@/types/payment.type"

export const PAYMENT_STATUS_CONTENT: Record<PaymentStatus, PaymentStatusContent> = {
  success: {
    badge: "Payment Successful",
    title: "Your payment has been completed!",
    description:
      "Thank you! Your transaction was successful. You can now continue working with your expert and track your project progress.",
    summaryTitle: "Transaction confirmed",
    summaryDescription: "A payment record has been created for this project.",
    primaryActionLabel: "View Project",
    primaryActionHref: "/client/projects",
    secondaryActionLabel: "Back Home",
    secondaryActionHref: "/",
  },
  failed: {
    badge: "Payment Failed",
    title: "We couldn’t process your payment",
    description:
      "Something went wrong during the transaction. Please check your payment method or try again.",
    summaryTitle: "Transaction not completed",
    summaryDescription:
      "No successful payment record was created. You can safely try again.",
    primaryActionLabel: "Try Again",
    primaryActionHref: "/payment",
    secondaryActionLabel: "Back Home",
    secondaryActionHref: "/",
  },
}