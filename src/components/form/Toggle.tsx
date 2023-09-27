import React, {
  ChangeEvent,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import s0 from './Toggle.module.scss';

export type ToggleProps = {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function Toggle({
  id,
  label,
  checked: theirChecked,
  disabled,
  onChange: theirOnChange,
}: ToggleProps) {
  const [checked, setChecked] = useState(!!theirChecked);
  const theirCheckedRef = useRef(!!theirChecked);
  useEffect(() => {
    if (theirCheckedRef.current !== theirChecked) setChecked(!!theirChecked);
    theirCheckedRef.current = !!theirChecked;
  }, [theirChecked]);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      setChecked(e.target.checked);
      if (theirOnChange) theirOnChange(e);
    },
    [disabled, theirOnChange],
  );
  return (
    <label htmlFor={id} className={s0.toggle}>
      <input
        className={s0.input}
        id={id}
        type="checkbox"
        onChange={onChange}
        checked={checked}
        disabled={disabled}
      />
      <span className={s0.track} />
      {label}
    </label>
  );
}
