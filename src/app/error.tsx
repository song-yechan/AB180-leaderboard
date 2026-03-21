"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">!</span>
        <h2 className="text-lg font-semibold text-camp-text">
          문제가 발생했습니다
        </h2>
        <p className="text-center text-sm text-camp-text-secondary">
          일시적인 오류일 수 있습니다. 다시 시도해주세요.
        </p>
      </div>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="cursor-pointer rounded-lg bg-camp-accent px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-camp-accent-hover"
      >
        다시 시도
      </button>
    </div>
  );
}
