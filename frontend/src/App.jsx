import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";

// Public pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Layout + Guard
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Dashboard
import DashboardPage from "./pages/DashboardPage";

// Placeholder pages
import DevToolsPage from "./pages/DevToolsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SnippetsPage from "./pages/SnippetsPage";
import DocsPage from "./pages/DocsPage";
import NotesPage from "./pages/NotesPage";
import EnvVaultPage from "./pages/EnvVaultPage";
import BookmarksPage from "./pages/BookmarksPage";
import SettingsPage from "./pages/SettingsPage";
import ActivityFeedPage from "./pages/ActivityFeedPage";

// Dev Tools
import ToolsIndex from "./pages/tools/ToolsIndex";
import JsonFormatterTool from "./components/tools/JsonFormatterTool";
import JwtDecoderTool from "./components/tools/JwtDecoderTool";
import JwtGeneratorTool from "./components/tools/JwtGeneratorTool";
import Base64Tool from "./components/tools/Base64Tool";
import UuidGeneratorTool from "./components/tools/UuidGeneratorTool";
import TimestampTool from "./components/tools/TimestampTool";
import HashGeneratorTool from "./components/tools/HashGeneratorTool";
import RegexPlaygroundTool from "./components/tools/RegexPlaygroundTool";
import ColorPaletteTool from "./components/tools/ColorPaletteTool";
import UrlEncoderTool from "./components/tools/UrlEncoderTool";
import TextDiffTool from "./components/tools/TextDiffTool";
import ToolLayout from "./layouts/ToolLayout";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            {/* Protected Dashboard Shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<ErrorBoundary><DashboardLayout /></ErrorBoundary>}>
                <Route path="/" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/dev-tools" element={<ErrorBoundary><DevToolsPage /></ErrorBoundary>} />
                <Route path="/projects" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
                <Route path="/snippets" element={<ErrorBoundary><SnippetsPage /></ErrorBoundary>} />
                <Route path="/docs" element={<ErrorBoundary><DocsPage /></ErrorBoundary>} />
                <Route path="/notes" element={<ErrorBoundary><NotesPage /></ErrorBoundary>} />
                <Route path="/env-vault" element={<ErrorBoundary><EnvVaultPage /></ErrorBoundary>} />
                <Route path="/bookmarks" element={<ErrorBoundary><BookmarksPage /></ErrorBoundary>} />
                <Route path="/activity" element={<ErrorBoundary><ActivityFeedPage /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                
                {/* Dev Tools sub-routes */}
                <Route path="/tools" element={<ErrorBoundary><ToolsIndex /></ErrorBoundary>} />
                <Route element={<ToolLayout />}>
                  <Route path="/tools/json-formatter" element={<ErrorBoundary><JsonFormatterTool /></ErrorBoundary>} />
                  <Route path="/tools/jwt-decoder" element={<ErrorBoundary><JwtDecoderTool /></ErrorBoundary>} />
                  <Route path="/tools/jwt-generator" element={<ErrorBoundary><JwtGeneratorTool /></ErrorBoundary>} />
                  <Route path="/tools/base64" element={<ErrorBoundary><Base64Tool /></ErrorBoundary>} />
                  <Route path="/tools/uuid-generator" element={<ErrorBoundary><UuidGeneratorTool /></ErrorBoundary>} />
                  <Route path="/tools/timestamp" element={<ErrorBoundary><TimestampTool /></ErrorBoundary>} />
                  <Route path="/tools/hash-generator" element={<ErrorBoundary><HashGeneratorTool /></ErrorBoundary>} />
                  <Route path="/tools/regex-playground" element={<ErrorBoundary><RegexPlaygroundTool /></ErrorBoundary>} />
                  <Route path="/tools/color-palette" element={<ErrorBoundary><ColorPaletteTool /></ErrorBoundary>} />
                  <Route path="/tools/url-encoder" element={<ErrorBoundary><UrlEncoderTool /></ErrorBoundary>} />
                  <Route path="/tools/text-diff" element={<ErrorBoundary><TextDiffTool /></ErrorBoundary>} />
                </Route>
              </Route>
            </Route>

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
