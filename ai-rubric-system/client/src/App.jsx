import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UploadAssignment from "./pages/UploadAssignment";
import Submissions from "./pages/Submissions";
import CreateRubric from "./pages/CreateRubric";
import EvaluateSubmission from "./pages/EvaluateSubmission";
import RoleRoute from "./components/RoleRoute";
import CourseDetail from "./pages/CourseDetail";
import CourseEvaluation from "./pages/CourseEvaluation";

const HomeRedirect = () => {
  const userRaw = localStorage.getItem("user");
  if (!userRaw) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userRaw);
    if (user?.role === "student") return <Navigate to="/student" replace />;
    if (user?.role === "teacher") return <Navigate to="/teacher" replace />;
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
  } catch {
    // ignore parse error and fall through to login
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/student"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        
        <Route
          path="/teacher"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <UploadAssignment />
            </RoleRoute>
          }
        />

        <Route
          path="/submissions"
          element={
            <RoleRoute allowedRoles={["teacher", "admin"]}>
              <Submissions />
            </RoleRoute>
          }
        />

        <Route
          path="/create-rubric"
          element={
            <RoleRoute allowedRoles={["teacher", "admin"]}>
              <CreateRubric />
            </RoleRoute>
          }
        />

        <Route
          path="/evaluate/:id"
          element={
            <RoleRoute allowedRoles={["teacher", "admin"]}>
              <EvaluateSubmission />
            </RoleRoute>
          }
        />

        <Route
          path="/course/:id"
          element={
            <RoleRoute allowedRoles={["student", "teacher", "admin"]}>
              <CourseDetail />
            </RoleRoute>
          }
        />

        <Route
          path="/evaluate-course/:id"
          element={
            <RoleRoute allowedRoles={["student", "teacher", "admin"]}>
              <CourseEvaluation />
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
