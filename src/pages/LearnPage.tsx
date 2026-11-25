import { Navigate } from "react-router-dom";

/** 배우기 탭 = 홈 패스와 동일 */
export function LearnPage() {
  return <Navigate to="/" replace />;
}
