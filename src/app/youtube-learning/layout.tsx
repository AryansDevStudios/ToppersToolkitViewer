
import { PremiumContentWrapper } from "@/components/common/PremiumContentWrapper";

export default function YoutubeLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PremiumContentWrapper>{children}</PremiumContentWrapper>;
}
