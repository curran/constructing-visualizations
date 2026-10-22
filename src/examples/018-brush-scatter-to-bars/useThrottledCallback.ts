import { useCallback, useEffect, useRef } from 'react';

// A throttle with leading and trailing edges. The wrapped callback runs
// immediately the first time it is called, then at most once every `interval`
// ms while calls keep arriving, and once more after the last call so the final
// value is never dropped.
//
// That shape suits brushing: the leading edge makes the first response instant,
// the interval caps how much work a drag can trigger, and the trailing edge
// guarantees the committed selection is exact even though intermediate frames
// were skipped. (A debounce would withhold every update until the drag paused,
// so nothing would move during the gesture.)
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  interval: number,
): (...args: Args) => void {
  // Keep the callback in a ref so the returned function stays stable even when
  // the caller passes an inline closure.
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);
  const pendingArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Drop any pending trailing call when the component goes away.
  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      const elapsed = Date.now() - lastRunRef.current;

      // Leading edge: nothing has run recently, so respond right away.
      if (elapsed >= interval) {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
        return;
      }

      // Too soon: remember the newest arguments and make sure a single
      // trailing call is scheduled to deliver them.
      pendingArgsRef.current = args;
      if (timeoutRef.current !== null) return;

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        const pending = pendingArgsRef.current;
        pendingArgsRef.current = null;
        if (!pending) return;

        lastRunRef.current = Date.now();
        callbackRef.current(...pending);
      }, interval - elapsed);
    },
    [interval],
  );
}
