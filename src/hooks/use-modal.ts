import { useCallback, useState } from "react";

// Tracks which single modal (by type) is open, so opening one automatically closes any other.
export const useModal = <T extends string>() => {
  const [type, setType] = useState<T | null>(null);

  // Opens the modal of the given type, replacing whichever one was open.
  const open = useCallback((next: T) => setType(next), []);

  // Closes whichever modal is open.
  const close = useCallback(() => setType(null), []);

  // Controlled props (`open`, `onOpenChange`) for the dialog that belongs to `modalType`; closing only
  // applies if that dialog is still the active one, so a late close event can't dismiss a newer modal.
  const bind = (modalType: T) => ({
    open: type === modalType,
    onOpenChange: (isOpen: boolean) =>
      setType((current) => (isOpen ? modalType : current === modalType ? null : current)),
  });

  return { type, open, close, bind };
};
