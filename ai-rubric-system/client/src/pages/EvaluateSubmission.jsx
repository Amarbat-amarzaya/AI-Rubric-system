import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link, useSearchParams } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const EvaluateSubmission = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("course");

  const [submission, setSubmission] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedbackVisible, setAiFeedbackVisible] = useState(false);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:3001/api/submissions/${id}`
        );

        setSubmission(res.data);
      } catch (error) {
        console.log("FETCH SUBMISSION ERROR:", error);
      }
    };

    fetchSubmission();
  }, [id]);

  const selectRating = (criterionIndex, itemIndex, ratingIndex, points) => {
    const key = `${criterionIndex}-${itemIndex}`;

    setSelectedRatings((prev) => ({
      ...prev,
      [key]: {
        ratingIndex,
        points,
      },
    }));
  };

  const totalScore = Object.values(selectedRatings).reduce(
    (sum, rating) => sum + rating.points,
    0
  );

  if (!submission) {
    return (
      <div className="page-shell min-h-screen p-6 text-white">
        Loading submission...
      </div>
    );
  }

  const rubric = submission.rubricId;

  const totalPoints = (rubric?.criteria || []).reduce((sum, criterion) => {
    const itemPoints = (criterion.items || []).reduce((itemSum, item) => {
      const maxRating = Math.max(
        ...(item.ratings || []).map((rating) => Number(rating.points) || 0),
        0
      );
      return itemSum + maxRating;
    }, 0);

    return sum + itemPoints;
  }, 0);

  const saveEvaluation = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:3001/api/submissions/evaluate/${id}`,
        {
          totalScore,
          selectedRatings,
          courseId,
        }
      );

      alert("Evaluation saved");
    } catch (error) {
      console.log("SAVE EVALUATION ERROR:", error);
      alert("Evaluation хадгалах үед алдаа гарлаа");
    }
  };

  const getAIFeedback = async () => {
    try {
      setAiLoading(true);
      setAiFeedbackVisible(true);
      setAiFeedback("");

      const res = await axios.post(
        "http://127.0.0.1:3001/api/ai/feedback",
        {
          rubricTitle: rubric.title,
          totalScore,
          totalPoints,
          selectedRatings,
        }
      );

      setAiFeedback(res.data.feedback || "AI feedback ирсэнгүй.");
    } catch (error) {
      console.log("AI FEEDBACK ERROR:", error);
      setAiFeedback(
        error.response?.data?.message || "AI feedback авах үед алдаа гарлаа."
      );
    } finally {
      setAiLoading(false);
      requestAnimationFrame(() => {
        feedbackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <LiquidPageShell
      badge="Submission review"
      title="Evaluate Submission"
      description="Student file, rubric criteria, AI feedback, print workflow бүгд нэг view дээр төвлөрсөн."
      maxWidth="max-w-7xl"
      headerActions={
        <Link
          to="/submissions"
          className="glass-link no-print"
        >
          ← Back to submissions
        </Link>
      }
    >
      <div id="evaluation-report">
        <div className="glass-panel mb-6 p-5">
          <p className="text-lg font-semibold">
            Student: {submission.studentName}
          </p>

          <p className="glass-muted mt-1 text-sm">
            Rubric: {rubric?.title || "No rubric"}
          </p>

          <p className="mt-1 text-sm text-slate-300/70">
            File: {submission.originalName}
          </p>

          <a
            href={`http://127.0.0.1:3001/${submission.filePath}`}
            target="_blank"
            rel="noreferrer"
            className="glass-link mt-3 inline-block"
          >
            View Uploaded File
          </a>
        </div>

        <div className="space-y-6">
          {(rubric?.criteria || []).map((criterion, criterionIndex) => (
            <div
              key={criterionIndex}
              className="glass-panel p-6"
            >
              <h2 className="mb-2 text-xl font-semibold">{criterion.title}</h2>

              {criterion.description && (
                <p className="glass-muted mb-4 text-sm">
                  {criterion.description}
                </p>
              )}

              {(criterion.items || []).map((item, itemIndex) => (
                <div key={itemIndex} className="mb-6 last:mb-0">
                  <p className="mb-3 text-slate-100">{item.text}</p>

                  <div className="grid gap-4 md:grid-cols-3">
                    {(item.ratings || []).map((rating, ratingIndex) => (
                      <div
                        key={ratingIndex}
                        onClick={() =>
                          selectRating(
                            criterionIndex,
                            itemIndex,
                            ratingIndex,
                            rating.points
                          )
                        }
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          selectedRatings[`${criterionIndex}-${itemIndex}`]
                            ?.ratingIndex === ratingIndex
                            ? "border-sky-300/70 bg-sky-400/16 shadow-[0_0_0_1px_rgba(186,230,253,0.2)_inset]"
                            : "border-white/10 bg-white/5 hover:border-sky-300/40"
                        }`}
                      >
                        <h4 className="font-semibold text-sky-200">
                          {rating.title}
                        </h4>

                        <p className="glass-muted mt-1 text-sm">
                          {rating.description}
                        </p>

                        <div className="mt-3 inline-block rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm">
                          {rating.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 text-2xl font-bold text-sky-300">
          Total Score: {totalScore} / {totalPoints}
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <button
            onClick={saveEvaluation}
            className="glass-button-success"
          >
            Save Evaluation
          </button>

          <button
            onClick={getAIFeedback}
            disabled={aiLoading}
            className="glass-button disabled:opacity-50"
          >
            {aiLoading ? "Generating..." : "Generate AI Feedback"}
          </button>
          <button
            onClick={printReport}
            className="glass-button-secondary"
          >
            Print / Save PDF
          </button>
        </div>

        <div
          ref={feedbackRef}
          className="glass-panel mt-6 p-6"
        >
          <h2 className="mb-3 text-xl font-semibold text-sky-200">
            AI Feedback
          </h2>

          {!aiFeedbackVisible && (
            <p className="glass-muted text-sm leading-7">
              `Generate AI Feedback` дарсны дараа энд хариу гарч ирнэ.
            </p>
          )}

          {aiLoading && (
            <p className="glass-muted text-sm leading-7">
              AI feedback үүсгэж байна...
            </p>
          )}

          {aiFeedbackVisible && !aiLoading && (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {aiFeedback || "AI feedback ирсэнгүй."}
            </p>
          )}
        </div>
      </div>
    </LiquidPageShell>
  );
};

export default EvaluateSubmission;
