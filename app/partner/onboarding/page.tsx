import { OnboardingFlow } from "@/components/onboarding-flow"
import { OnboardingProvider } from "@/contexts/onboarding-context"

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}
