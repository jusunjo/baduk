import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { PageAsk } from "./components/PageAsk";
import { setupNative } from "./lib/native";
import { actions, useStore } from "./lib/store";
import { ExamPlayPage } from "./pages/ExamPlayPage";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPlayPage } from "./pages/LessonPlayPage";
import { MissionPlayPage } from "./pages/MissionPlayPage";
import { PathPage } from "./pages/PathPage";
import { PracticePage } from "./pages/PracticePage";
import { PracticePlayPage } from "./pages/PracticePlayPage";
import { AiHubPage } from "./pages/AiHubPage";
import { AiPlayPage } from "./pages/AiPlayPage";
import { WelcomePage } from "./pages/WelcomePage";

const TABS = ["/", "/learn", "/practice", "/play", "/path"]; // /learn redirects to /

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

  useEffect(() => {
    const color = "#131F24";
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", color);
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }, [pathname]);

  // 예전 ‘입문’ 저장값은 30급 세션으로 승격
  useEffect(() => {
    if (currentRank === "beginner") actions.setCurrentRank("g30");
  }, [currentRank]);

  if (!currentRank && pathname !== "/welcome") {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/:lessonId" element={<LessonPlayPage />} />
        <Route path="/mission/:missionId" element={<MissionPlayPage />} />
        <Route path="/exam/:rankId" element={<ExamPlayPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:lessonId/:problemId" element={<PracticePlayPage />} />
        <Route path="/play" element={<AiHubPage />} />
        <Route path="/play/ai" element={<AiPlayPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PageAsk />
    </>
  );
}
