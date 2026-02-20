/**
 * Typed Redux hooks.
 * Use these instead of the plain `useDispatch` / `useSelector` from react-redux.
 */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
