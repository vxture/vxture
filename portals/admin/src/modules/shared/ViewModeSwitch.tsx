import { Icon } from '@vxture/design-system';

export type ViewModeSwitchValue = 'list' | 'cards';

export function ViewModeSwitch({
  value,
  onChange,
  ariaLabel = '展示方式',
}: {
  value: ViewModeSwitchValue;
  onChange: (mode: ViewModeSwitchValue) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="vx-view-mode-switch" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={value === 'list' ? 'is-active' : undefined}
        onClick={() => onChange('list')}
        aria-label="列表"
        title="列表"
      >
        <Icon name="list" size="lg" fallback="placeholder" />
      </button>
      <button
        type="button"
        className={value === 'cards' ? 'is-active' : undefined}
        onClick={() => onChange('cards')}
        aria-label="卡片"
        title="卡片"
      >
        <Icon name="squares-four" size="lg" fallback="placeholder" />
      </button>
    </div>
  );
}
