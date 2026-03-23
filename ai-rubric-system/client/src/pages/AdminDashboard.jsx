import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    teacherId: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:3001/api/courses");
        setCourses(res.data);
      } catch (error) {
        console.log("FETCH COURSES ERROR:", error);
      }
    };

    const fetchTeachers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:3001/api/users/teachers");
        setTeachers(res.data);
      } catch (error) {
        console.log("FETCH TEACHERS ERROR:", error);
      }
    };

    fetchCourses();
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.courseCode || !form.courseName || !form.teacherId) {
      setMessage("Бүх талбарыг бөглөнө үү");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await axios.post("http://127.0.0.1:3001/api/courses", form);

      setMessage("Course амжилттай үүслээ");
      setForm({
        courseCode: "",
        courseName: "",
        teacherId: "",
      });
      const coursesRes = await axios.get("http://127.0.0.1:3001/api/courses");
      setCourses(coursesRes.data);
    } catch (error) {
      console.log("CREATE COURSE ERROR:", error);
      setMessage(error.response?.data?.message || "Course үүсгэх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcelReport = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:3001/api/reports/excel",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "evaluation-report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("DOWNLOAD EXCEL ERROR:", error);
      setMessage(
        error.response?.data?.message || "Excel report татах үед алдаа гарлаа"
      );
    }
  };

  return (
    <LiquidPageShell
      badge="Control center"
      title="Admin Dashboard"
      description="Course, teacher assignment, rubric management болон report export бүгд нэг glass control panel дотор төвлөрлөө."
      maxWidth="max-w-7xl"
    >
        <div className="glass-buttun grid gap-6 lg:grid-cols-2">
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-4">Create Course</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Course Code
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={form.courseCode}
                  onChange={handleChange}
                  placeholder="S.IT101"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder="Web Programming"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Teacher
                </label>
                <select
                  name="teacherId"
                  value={form.teacherId}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="">Teacher сонгоно уу</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-button disabled:opacity-50 "
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-sm font-medium text-emerald-300">
                {message}
              </p>
            )}
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>

            <div className="space-y-4">
              <Link
                to="/submissions"
                className="glass-card glass-interactive block p-4"
              >
                Manage Submissions
              </Link>

              <Link
                to="/create-rubric"
                className="glass-card glass-interactive block p-4"
              >
                Manage Rubrics
              </Link>

              <button
                type="button"
                onClick={downloadExcelReport}
                className="glass-button-success w-full"
              >
                Download Excel Report
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel mt-8 p-6">
          <h2 className="text-2xl font-semibold mb-4">Course List</h2>

          {courses.length === 0 ? (
            <p className="glass-muted">Одоогоор course алга байна.</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="glass-card glass-interactive flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="text-lg font-semibold">{course.courseCode}</p>
                    <p className="glass-muted">{course.courseName}</p>
                    <p className="text-sm text-slate-300/70">
                      Teacher: {course.teacherId?.name || "No teacher"}
                    </p>
                  </div>

                  <Link
                    to={`/course/${course._id}`}
                    className="glass-button whitespace-nowrap px-4 py-2 text-sm"
                  >
                    Open Course
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
    </LiquidPageShell>
  );
};

export default AdminDashboard;
