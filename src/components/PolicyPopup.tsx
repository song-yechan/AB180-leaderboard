"use client";

import { useEffect, useRef } from "react";

interface PolicyPopupProps {
  onClose: () => void;
}

export default function PolicyPopup({ onClose }: PolicyPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = el!.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTab);
    const firstBtn = el.querySelector<HTMLElement>("button");
    firstBtn?.focus();
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="사용량 추적 정책"
    >
      <div
        ref={contentRef}
        className="relative mx-4 my-8 w-full max-w-2xl animate-fade-rise rounded-2xl border border-camp-border bg-camp-bg p-6 shadow-2xl sm:my-12"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-camp-text-secondary transition-colors hover:bg-camp-surface-hover hover:text-camp-text"
          aria-label="닫기"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col gap-6">
          {/* Title */}
          <h2 className="text-lg font-bold text-camp-text">
            사용량 추적 정책
          </h2>

          {/* Section: 어떤 데이터를 수집하나요? */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">
              어떤 데이터를 수집하나요?
            </h3>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-camp-text-secondary">
              <li>토큰 사용량 (Input, Output, Cache Read, Cache Create)</li>
              <li>세션 수, 커밋 수, PR 수</li>
              <li>사용 모델 정보</li>
            </ul>
          </section>

          {/* Section: 언제 수집되나요? */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">
              언제 수집되나요?
            </h3>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-camp-text-secondary">
              <li>
                <span className="font-medium text-camp-text">Claude Code</span>
                : 세션 종료 시 (exit 또는 /exit) 자동 전송
              </li>
              <li>
                <span className="font-medium text-camp-text">Codex</span>: 세션
                종료 시 자동 전송
              </li>
              <li>30분 간격으로 중간 전송 (세션이 길 경우)</li>
              <li>세션 시작 시 이전에 전송 실패한 데이터 재전송</li>
            </ul>
          </section>

          {/* Section: exit 안 하고 터미널을 닫으면? */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">
              exit 안 하고 터미널을 닫으면?
            </h3>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-camp-text-secondary">
              <li>다음 세션 시작 시 자동으로 복구됩니다</li>
              <li>로컬에 큐로 저장되어 데이터가 유실되지 않습니다</li>
            </ul>
          </section>

          {/* Section: 리더보드 기준 */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">
              리더보드 기준
            </h3>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-camp-text-secondary">
              <li>
                <span className="font-medium text-camp-text">정렬</span>: 총
                토큰 수 기준 (Input + Output + Cache)
              </li>
              <li>
                <span className="font-medium text-camp-text">비용</span>: 모델별
                토큰 단가로 자동 계산
              </li>
              <li>
                <span className="font-medium text-camp-text">커밋</span>: 당일
                git log 기준 (본인 커밋만)
              </li>
            </ul>
          </section>

          {/* Section: 레벨 & XP */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">
              레벨 &amp; XP
            </h3>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-camp-text-secondary">
              <li>XP = 총 토큰 x 배율 (개발자 0.7x, 비개발자 1.0x)</li>
              <li>20단계 포켓몬 레벨 시스템</li>
            </ul>
          </section>

          {/* Section: 지원 CLI */}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-camp-text">지원 CLI</h3>
            <div className="overflow-x-auto rounded-xl border border-camp-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-camp-border bg-camp-surface">
                    <th className="px-3 py-2 text-left font-semibold text-camp-text">
                      CLI
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-camp-text">
                      지원 모델
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-camp-text">
                      가격 (per 1M tokens)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-camp-text-secondary">
                  <tr className="border-b border-camp-border">
                    <td className="px-3 py-2 font-medium text-camp-text">
                      Claude Code
                    </td>
                    <td className="px-3 py-2">
                      Opus $15/$75, Sonnet $3/$15, Haiku $0.8/$4
                    </td>
                    <td className="px-3 py-2">Input/Output</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-camp-text">
                      Codex
                    </td>
                    <td className="px-3 py-2">
                      o3 $10/$40, o4-mini $1.1/$4.4, gpt-4.1 $2/$8
                    </td>
                    <td className="px-3 py-2">Input/Output</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
