import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
export const useCurrentUser = () => {
  const user = useSelector((state: RootState) => state.user);
  return user;
};
