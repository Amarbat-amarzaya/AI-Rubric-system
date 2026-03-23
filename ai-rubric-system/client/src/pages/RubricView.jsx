import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const defaultRatings = () => [
  { title: "Excellent", description: "", points: 5 },
  { title: "Good", description: "", points: 3 },
  { title: "Poor", description: "", points: 1 },
];

const normalizeRubricCriteria = (criteria = []) => {
  if (!Array.isArray(criteria)) return [];

  return criteria.map((criterion, criterionIndex) => ({
    title: criterion?.title || `Criterion ${criterionIndex + 1}`,
    description: criterion?.description || "",
    items:
      Array.isArray(criterion?.items) && criterion.items.length > 0
        ? criterion.items.map((item, itemIndex) => ({
            text:
              typeof item === "string"
                ? item
                : item?.text || `Дэд шалгуур ${itemIndex + 1}`,
            ratings:
              Array.isArray(item?.ratings) && item.ratings.length > 0
                ? item.ratings.map((rating) => ({
                    title: rating?.title || "New Rating",
                    description: rating?.description || "",
                    points: Number(rating?.points) || 0,
                  }))
                : defaultRatings(),
          }))
        : [],
  }));
};

const RubricView = () => {
  const { id } = useParams();

  const [rubric, setRubric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedbackVisible, setAiFeedbackVisible] = useState(false);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:3001/api/rubrics/${id}`);

        setRubric({
          ...res.data,
          criteria: normalizeRubricCriteria(res.data.criteria),
        });
      } catch (error) {
        console.log(error);
        setRubric(null);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-900 p-6">
          Loading rubric...
        </div>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-slate-900 p-6">
          <p className="text-lg font-semibold">Rubric олдсонгүй.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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

  const totalScore = Object.values(selectedRatings).reduce(
    (sum, rating) => sum + rating.points,
    0
  );

  const getAIFeedback = async () => {
    try {
      setAiLoading(true);
      setAiFeedbackVisible(true);
      setAiFeedback("");

      const res = await axios.post("http://127.0.0.1:3001/api/ai/feedback", {
        rubricTitle: rubric.title,
        totalScore,
        totalPoints,
        selectedRatings,
      });

      setAiFeedback(res.data.feedback || "");
    } catch (error) {
      console.log(error);
      setAiFeedback(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "AI feedback үүсгэх үед алдаа гарлаа"
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/"
              className="mb-3 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold">{rubric.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Criteria: {rubric.criteria?.length || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 px-6 py-4 text-right">
            <p className="text-sm text-slate-400">Total Points</p>
            <p className="text-3xl font-bold text-indigo-400">
              {totalScore} / {totalPoints}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={getAIFeedback}
            disabled={aiLoading}
            className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {aiLoading ? "Generating..." : "Generate AI Feedback"}
          </button>

          <div
            ref={feedbackRef}
            className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-6"
          >
            <h2 className="mb-3 text-xl font-semibold text-indigo-300">
              AI Feedback
            </h2>

            {!aiFeedbackVisible && (
              <p className="text-sm leading-7 text-slate-400">
                `Generate AI Feedback` дарсны дараа энд хариу гарч ирнэ.
              </p>
            )}

            {aiLoading && (
              <p className="text-sm leading-7 text-slate-400">
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

        <div className="space-y-6">
          {(rubric.criteria || []).map((criterion, criterionIndex) => (
            <div
              key={criterionIndex}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-100">
                  {criterion.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {criterion.description || "No description"}
                </p>
              </div>

              <div className="space-y-4">
                {(criterion.items || []).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-slate-200">
                        {item.text}
                      </h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {(item.ratings || []).map((rating, ratingIndex) => {
                        const selected =
                          selectedRatings[`${criterionIndex}-${itemIndex}`]
                            ?.ratingIndex === ratingIndex;

                        return (
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
                              selected
                                ? "border-indigo-500 bg-indigo-900/40"
                                : "border-white/10 bg-slate-900 hover:border-indigo-400"
                            }`}
                          >
                            <h4 className="mb-2 text-lg font-semibold text-indigo-300">
                              {rating.title}
                            </h4>

                            <p className="mb-4 text-sm leading-6 text-slate-400">
                              {rating.description || "No description"}
                            </p>

                            <div className="inline-flex rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                              {rating.points} points
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RubricView;
