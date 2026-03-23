import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:3001/api/rubrics/course/${id}`
        );
        setRubric(res.data);
      } catch (error) {
        console.log("FETCH RUBRIC BY COURSE ERROR:", error);
        setRubric(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRubric();
  }, [id]);

  if (loading) {
    return <div className="page-shell min-h-screen p-6 text-white">Loading...</div>;
  }

  if (!rubric) {
    return (
      <div className="page-shell min-h-screen p-6 text-white">
        Энэ course дээр rubric алга байна.
      </div>
    );
  }

  return (
    <LiquidPageShell
      badge="Course rubric"
      title={rubric.title}
      description="Доорх criterion-уудыг review хийгээд evaluation руу шууд орж болно."
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {(rubric.criteria || []).map((c, i) => (
          <div
            key={i}
            className="glass-card glass-interactive p-5"
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="glass-muted">
              {(c.items || []).length} items
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(`/evaluate-course/${id}`)}
        className="glass-button mt-6"
      >
        Start Evaluation
      </button>
    </LiquidPageShell>
  );
};

export default CourseDetail;
