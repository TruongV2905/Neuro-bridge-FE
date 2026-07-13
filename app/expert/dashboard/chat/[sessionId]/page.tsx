import { PrivateChatView } from "@/features/private-chat"

type ExpertPrivateChatSessionPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export default async function ExpertPrivateChatSessionPage({
  params,
}: ExpertPrivateChatSessionPageProps) {
  const { sessionId } = await params

  return <PrivateChatView sessionId={sessionId} />
}
