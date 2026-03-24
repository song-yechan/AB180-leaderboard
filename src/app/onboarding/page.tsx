import SetupGuide from "@/components/SetupGuide";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-camp-text">시작하기</h1>
        <p className="mt-2 text-sm text-camp-text-secondary">
          사용하는 AI 코딩 도구를 선택하고, 터미널에서 설정을 완료하세요.
        </p>
      </div>
      <SetupGuide />
    </div>
  );
}
