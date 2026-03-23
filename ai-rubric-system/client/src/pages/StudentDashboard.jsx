import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:3001/api/courses");
        setCourses(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <LiquidPageShell
      badge="Student space"
      title="Select Course"
      description="Суралцах хичээлээ сонгоод rubric болон evaluation flow руу орно."
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

export default StudentDashboard;
