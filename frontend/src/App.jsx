import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Public pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Layout + Guard
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Dashboard
import DashboardPage from "./pages/DashboardPage";

// Placeholder pages
import DevToolsPage from "./pages/DevToolsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SnippetsPage from "./pages/SnippetsPage";
import DocsPage from "./pages/DocsPage";
import NotesPage from "./pages/NotesPage";
import EnvVaultPage from "./pages/PlaceholderPage";
import BookmarksPage from "./pages/PlaceholderPage";
import SettingsPage from "./pages/PlaceholderPage";

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
        <BrowserRouter>
          <Routes>
            {/* Protected Dashboard Shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dev-tools" element={<DevToolsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/snippets" element={<SnippetsPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/env-vault" element={<EnvVaultPage title="Env Vault" icon="🔐" />} />
                <Route path="/bookmarks" element={<BookmarksPage title="Bookmarks" icon="🔖" />} />
                <Route path="/settings" element={<SettingsPage title="Settings" icon="⚙️" />} />

                {/* Dev Tools sub-routes */}
                <Route path="/tools" element={<ToolsIndex />} />
                <Route element={<ToolLayout />}>
                  <Route path="/tools/json-formatter" element={<JsonFormatterTool />} />
                  <Route path="/tools/jwt-decoder" element={<JwtDecoderTool />} />
                  <Route path="/tools/jwt-generator" element={<JwtGeneratorTool />} />
                  <Route path="/tools/base64" element={<Base64Tool />} />
                  <Route path="/tools/uuid-generator" element={<UuidGeneratorTool />} />
                  <Route path="/tools/timestamp" element={<TimestampTool />} />
                  <Route path="/tools/hash-generator" element={<HashGeneratorTool />} />
                  <Route path="/tools/regex-playground" element={<RegexPlaygroundTool />} />
                  <Route path="/tools/color-palette" element={<ColorPaletteTool />} />
                  <Route path="/tools/url-encoder" element={<UrlEncoderTool />} />
                  <Route path="/tools/text-diff" element={<TextDiffTool />} />
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
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
