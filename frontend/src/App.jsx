import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";

// Layouts & Guards
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

// Auth pages (NOT lazy - critical path)
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import HomePage from "./pages/HomePage";

// Lazy load dashboard pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DevToolsPage = lazy(() => import("./pages/DevToolsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const SnippetsPage = lazy(() => import("./pages/SnippetsPage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const EnvVaultPage = lazy(() => import("./pages/EnvVaultPage"));
const ApiVaultPage = lazy(() => import("./pages/ApiVaultPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ActivityFeedPage = lazy(() => import("./pages/ActivityFeedPage"));

// Lazy load dev tools
const ToolsIndex = lazy(() => import("./pages/tools/ToolsIndex"));
const JsonFormatterTool = lazy(() => import("./components/tools/JsonFormatterTool"));
const JwtDecoderTool = lazy(() => import("./components/tools/JwtDecoderTool"));
const JwtGeneratorTool = lazy(() => import("./components/tools/JwtGeneratorTool"));
const Base64Tool = lazy(() => import("./components/tools/Base64Tool"));
const UuidGeneratorTool = lazy(() => import("./components/tools/UuidGeneratorTool"));
const TimestampTool = lazy(() => import("./components/tools/TimestampTool"));
const HashGeneratorTool = lazy(() => import("./components/tools/HashGeneratorTool"));
const RegexPlaygroundTool = lazy(() => import("./components/tools/RegexPlaygroundTool"));
const ColorPaletteTool = lazy(() => import("./components/tools/ColorPaletteTool"));
const UrlEncoderTool = lazy(() => import("./components/tools/UrlEncoderTool"));
const TextDiffTool = lazy(() => import("./components/tools/TextDiffTool"));
const ToolLayout = lazy(() => import("./layouts/ToolLayout"));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes (not lazy) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/" element={<HomePage />} />

              {/* Protected Dashboard with Lazy Loading */}
              <Route element={<ProtectedRoute />}>
                <Route element={<ErrorBoundary><DashboardLayout /></ErrorBoundary>}>
                  <Route 
                    path="/dashboard" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <DashboardPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/dev-tools" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <DevToolsPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/projects" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProjectsPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/snippets" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <SnippetsPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/docs" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <DocsPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/notes" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <NotesPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/env-vault" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <EnvVaultPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/api-vault" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ApiVaultPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/bookmarks" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <BookmarksPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/activity-feed" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ActivityFeedPage />
                      </Suspense>
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <SettingsPage />
                      </Suspense>
                    } 
                  />
                </Route>

                {/* Tools Routes */}
                <Route 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ToolLayout />
                    </Suspense>
                  }
                >
                  <Route 
                    path="/tools" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ToolsIndex />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/json-formatter" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <JsonFormatterTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/jwt-decoder" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <JwtDecoderTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/jwt-generator" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <JwtGeneratorTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/base64" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Base64Tool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/uuid" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <UuidGeneratorTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/timestamp" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TimestampTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/hash" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <HashGeneratorTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/regex" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <RegexPlaygroundTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/color-palette" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ColorPaletteTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/url-encoder" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <UrlEncoderTool />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/tools/text-diff" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <TextDiffTool />
                      </Suspense>
                    } 
                  />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
