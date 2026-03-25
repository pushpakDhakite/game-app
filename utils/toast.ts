import { TOAST_DURATION_MS } from '@/constants/game';

type ToastSetter = (msg: string | null) => void;
type ShowSetter = (show: boolean) => void;
type TimerRef = { current: ReturnType<typeof setTimeout> | null };

export function triggerToast(
  message: string,
  setToastMessage: ToastSetter,
  setShowToast: ShowSetter,
  toastTimerRef: TimerRef,
  duration: number = TOAST_DURATION_MS,
): void {
  setToastMessage(message);
  setShowToast(true);
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  toastTimerRef.current = setTimeout(() => setShowToast(false), duration);
}
