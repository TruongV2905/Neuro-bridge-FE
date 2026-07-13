import { Suspense } from "react";

import { PaymentReturnView } from "@/features/payment";

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnView />
    </Suspense>
  );
}
