"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export type PromptInputChip = {
  /** Display label for the chip */
  label: string;
  /** Whether this chip is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
};

export type PromptInputProps = {
  /** Current prompt value (controlled) */
  value: string;
  onChange: (next: string) => void;
  /** Submit handler — receives the current value */
  onSubmit?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Toolbar chips above the textarea */
  chips?: PromptInputChip[];
  /** Hint shown in footer (e.g. keyboard shortcut) */
  hint?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Disable the submit button (e.g. while generating) */
  busy?: boolean;
  className?: string;
};

/**
 * PromptInput — AI-specific input surface.
 *
 * Distinguishes from a plain Textarea by including a model/attachment/
 * command toolbar, an AI-tinted focus ring, and an aurora-gradient
 * submit action. Cmd+Enter submits.
 *
 * @example
 *   const [v, setV] = useState('');
 *   <PromptInput
 *     value={v} onChange={setV}
 *     onSubmit={runPrompt}
 *     chips={[
 *       { label: '@claude-haiku', active: true },
 *       { label: '📎 attach', onClick: openFilePicker },
 *       { label: '/ commands', onClick: openCommandPalette },
 *     ]}
 *     hint="⌘↵ to send"
 *   />
 */
export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything...",
  chips,
  hint = "⌘↵ to send",
  submitLabel = "Generate",
  busy = false,
  className,
}: PromptInputProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!busy) onSubmit?.(value);
    }
  };

  return (
    <div
      className={cn(
        "vx-prompt-input",
        busy && "vx-prompt-input--busy",
        className,
      )}
    >
      {chips && chips.length > 0 && (
        <div className="vx-prompt-input__toolbar">
          {chips.map((c, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "vx-prompt-input__chip",
                c.active && "vx-prompt-input__chip--active",
              )}
              onClick={c.onClick}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <textarea
        className="vx-prompt-input__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={3}
      />
      <div className="vx-prompt-input__footer">
        <span className="vx-prompt-input__hint">{hint}</span>
        <button
          type="button"
          className="vx-prompt-input__send"
          disabled={busy || !value.trim()}
          onClick={() => onSubmit?.(value)}
        >
          ✨ {submitLabel}
        </button>
      </div>
    </div>
  );
}
