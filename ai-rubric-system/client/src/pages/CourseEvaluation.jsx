import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import LiquidPageShell from "../components/LiquidPageShell";

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const CourseEvaluation = () => {
  const { id } = useParams();
  const user = parseStoredUser();

  const [rubric, setRubric] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [message, setMessage] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedbackVisible, setAiFeedbackVisible] = useState(false);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:3001/api/rubrics/course/${id}`
        );
        setRubric(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRubric();
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

  if (!rubric) {
    return (
      <div className="page-shell min-h-screen p-6 text-white">
        Loading rubric...
      </div>
    );
  }

  const totalScore = Object.values(selectedRatings).reduce(
    (sum, item) => sum + item.points,
    0
  );

  const totalPoints = (rubric.criteria || []).reduce((sum, criterion) => {
    const itemPoints = (criterion.items || []).reduce((itemSum, item) => {
      const maxRating = Math.max(
        ...(item.ratings || []).map((rating) => Number(rating.points) || 0),
        0
      );
      return itemSum + maxRating;
    }, 0);

    return sum + itemPoints;
  }, 0);

  const saveCourseEvaluation = async () => {
    try {
      await axios.post("http://127.0.0.1:3001/api/evaluations", {
        courseId: id,
        rubricId: rubric._id,
        evaluatorId: user?._id,
        evaluatorRole: user?.role,
        teacherId: rubric.courseId?.teacherId || null,
        totalScore,
        selectedRatings,
      });

      setMessage("Үнэлгээ амжилттай хадгалагдлаа");
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Үнэлгээ хадгалах үед алдаа гарлаа"
      );
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

  return (
    <LiquidPageShell
      badge="Live scoring"
      title={rubric.title}
      maxWidth="max-w-7xl"
      headerActions={
        <Link
          to={
            user?.role === "admin"
              ? "/admin"
              : user?.role === "teacher"
                ? "/teacher"
                : "/student"
          }
          className="glass-link"
        >
          ← Back
        </Link>
      }
    >

        <div className="space-y-6">
          {(rubric.criteria || []).map((criterion, criterionIndex) => (
            <div
              key={criterionIndex}
              className="glass-panel p-6"
            >
              <h2 className="mb-4 text-xl font-semibold">{criterion.title}</h2>

              {(criterion.items || []).map((item, itemIndex) => (
                <div key={itemIndex} className="mb-6">
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={saveCourseEvaluation}
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
        </div>

        {message && (
          <p className="mt-4 text-sm font-medium text-emerald-300">{message}</p>
        )}

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
    </LiquidPageShell>
  );
};

export default CourseEvaluation;
