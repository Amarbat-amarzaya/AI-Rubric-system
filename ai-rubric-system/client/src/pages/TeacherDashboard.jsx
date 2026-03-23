import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const user = parseStoredUser();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?._id) return;

      try {
        const res = await axios.get(
          `http://127.0.0.1:3001/api/courses/my/${user._id}`
        );
        setCourses(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourses();
  }, [user?._id]);

  if (!user) {
    return (
      <div className="page-shell min-h-screen px-6 py-8 text-white">
        Please login again.
      </div>
    );
  }

  return (
    <LiquidPageShell
      badge="Teacher space"
      title="My Courses"
      description="Хариуцаж байгаа хичээлүүдээ нээгээд rubric болон үнэлгээний урсгалыг удирдана."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course._id}
            to={`/course/${course._id}`}
            className="glass-card glass-interactive block p-5"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-sky-200/80">
              {course.courseCode}
            </p>
            <h2 className="text-xl font-semibold">{course.courseName}</h2>
          </Link>
        ))}
      </div>
    </LiquidPageShell>
  );
};

export default TeacherDashboard;
