import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:3001/api/submissions");
      setSubmissions(res.data);
    } catch (error) {
      console.log("FETCH SUBMISSIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell min-h-screen px-6 py-8 text-white">
        <div className="glass-panel mx-auto max-w-6xl p-6">
          Loading submissions...
        </div>
      </div>
    );
  }

  return (
    <LiquidPageShell
      badge="Review queue"
      title="Submissions"
      description="Ирсэн файлуудыг шалгаад evaluation workflow руу шууд шилжинэ."
    >
        {submissions.length === 0 ? (
          <div className="glass-panel p-6 text-slate-300">
            Одоогоор submission алга байна.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="glass-card glass-interactive flex items-center justify-between rounded-2xl p-5"
              >
                <div>
                  <p className="text-lg font-semibold">
                    {submission.studentName}
                  </p>

                  <p className="text-sm text-slate-400">
                    Rubric: {submission.rubricId?.title || "No rubric"}
                  </p>

                  <p className="text-sm text-slate-500">
                    File: {submission.originalName}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Status: {submission.status}
                  </p>
                </div>

                <Link
                  to={`/evaluate/${submission._id}`}
                  className="glass-button px-4 py-2 text-sm"
                >
                  Evaluate
                </Link>
              </div>
            ))}
          </div>
        )}
    </LiquidPageShell>
  );
};

export default Submissions;
