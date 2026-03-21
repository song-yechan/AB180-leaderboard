"use client";

import { useEffect, useState } from "react";

interface UserMe {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
  department: string | null;
  cohort: string | null;
  api_token: string | null;
}

export default function SetupGuide() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const curlCommand = user?.api_token
    ? `curl -sL "${typeof window !== "undefined" ? window.location.origin : ""}/api/setup" | bash -s -- ${user.api_token}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-camp-surface p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="text-sm text-camp-text-secondary">불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!user || !user.api_token) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-camp-surface p-6">
        <p className="text-sm text-camp-text-secondary">로그인 후 이용 가능합니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-camp-surface p-6">
      <h3 className="mb-4 text-lg font-semibold text-camp-text">
        Claude Code 사용량 추적 설정
      </h3>

      <p className="mb-3 text-sm text-camp-text-secondary">
        터미널에 아래 한 줄만 붙여넣기하세요:
      </p>

      <div className="mb-3 rounded-lg border border-camp-border bg-camp-bg p-4">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm text-camp-accent">
          {curlCommand}
        </pre>
      </div>

      <button
        onClick={handleCopy}
        className="mb-4 w-full cursor-pointer rounded-lg bg-camp-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-camp-accent-hover"
      >
        {copied ? "복사됨!" : "명령어 복사하기"}
      </button>

      <details className="group">
        <summary className="cursor-pointer text-sm text-camp-text-secondary transition-colors hover:text-camp-text">
          어떻게 하나요?
        </summary>
        <ol className="mt-3 space-y-2 pl-1 text-sm text-camp-text-muted">
          <li className="flex items-start gap-2">
            <span className="shrink-0 font-mono text-camp-accent">1.</span>
            <span>Mac: <strong className="text-camp-text">Cmd+Space</strong> → "터미널" 검색 → 실행</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 font-mono text-camp-accent">2.</span>
            <span>위 명령어를 복사해서 붙여넣기 (<strong className="text-camp-text">Cmd+V</strong>)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 font-mono text-camp-accent">3.</span>
            <span><strong className="text-camp-text">Enter</strong> 누르면 설정 완료!</span>
          </li>
        </ol>
        <p className="mt-2 text-xs text-camp-text-muted">
          한 번만 하면 됩니다. 이후 Claude Code를 쓸 때마다 사용량이 자동으로 리더보드에 반영됩니다.
        </p>
      </details>
    </div>
  );
}
