import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { PageAsk } from "./components/PageAsk";
import { setupNative } from "./lib/native";
import { useStore } from "./lib/store";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPlayPage } from "./pages/LessonPlayPage";
import { PathPage } from "./pages/PathPage";
import { WelcomePage } from "./pages/WelcomePage";

const TABS = ["/", "/learn", "/path"];

function useNativeBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = useRef(location.pathname);
  path.current = location.pathname;
  useEffect(() => {
    setupNative(() => {
      if (path.current === "/" || path.current === "/welcome") return false;
      if (TABS.includes(path.current)) navigate("/", { replace: true });
      else navigate(-1);
      return true;
    });
  }, [navigate]);
}

export function App() {
  const { currentRank } = useStore();
  const { pathname } = useLocation();
  useNativeBack();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!currentRank && pathname !== "/welcome") return <Navigate to="/welcome" replace />;

  return (
    <>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/:lessonId" element={<LessonPlayPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PageAsk />
    </>
  );
}
