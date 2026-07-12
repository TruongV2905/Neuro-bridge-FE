import { PrivateChatView } from "@/features/private-chat"

type ClientPrivateChatSessionPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export default async function ClientPrivateChatSessionPage({
  params,
}: ClientPrivateChatSessionPageProps) {
  const { sessionId } = await params

  return <PrivateChatView sessionId={sessionId} />
}