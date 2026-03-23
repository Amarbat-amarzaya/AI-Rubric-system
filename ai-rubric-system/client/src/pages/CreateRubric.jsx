import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import LiquidPageShell from "../components/LiquidPageShell";

const defaultRatings = () => [
  { title: "Excellent", description: "", points: 5 },
  { title: "Good", description: "", points: 3 },
  { title: "Poor", description: "", points: 1 },
];

const defaultItem = (i = 1) => ({
  text: `Дэд шалгуур ${i}`,
  ratings: defaultRatings(),
});

const defaultCriterion = (i = 1) => ({
  title: `Criterion ${i}`,
  description: "",
  items: [defaultItem(1), defaultItem(2), defaultItem(3), defaultItem(4)],
});

const normalizeRubricCriteria = (criteria = []) => {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return [defaultCriterion(1)];
  }

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
        : [defaultItem(1)],
  }));
};

const CreateRubric = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState("Untitled Rubric");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState([defaultCriterion(1)]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:3001/api/courses");
        setCourses(res.data);
      } catch (error) {
        console.log("FETCH COURSES ERROR:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchRubricById = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:3001/api/rubrics/${id}`);
        const rubric = res.data;

        setTitle(rubric.title || "Untitled Rubric");
        setSelectedCourse(rubric.courseId?._id || rubric.courseId || "");
        setCriteria(normalizeRubricCriteria(rubric.criteria));
      } catch (error) {
        setMessage("Rubric татах үед алдаа гарлаа");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchRubricById();
    }
  }, [id, isEditMode]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...criteria];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setCriteria(reordered);
  };

  const updateCriterionField = (criterionIndex, field, value) => {
    const updated = [...criteria];
    updated[criterionIndex][field] = value;
    setCriteria(updated);
  };

  const updateItem = (criterionIndex, itemIndex, value) => {
    const updated = [...criteria];

    if (!Array.isArray(updated[criterionIndex].items)) {
      updated[criterionIndex].items = [];
    }

    if (!updated[criterionIndex].items[itemIndex]) {
      updated[criterionIndex].items[itemIndex] = defaultItem(itemIndex + 1);
    }

    updated[criterionIndex].items[itemIndex].text = value;
    setCriteria(updated);
  };

  const addItem = (criterionIndex) => {
    const updated = [...criteria];

    if (!Array.isArray(updated[criterionIndex].items)) {
      updated[criterionIndex].items = [];
    }

    const nextIndex = updated[criterionIndex].items.length + 1;
    updated[criterionIndex].items.push(defaultItem(nextIndex));

    setCriteria(updated);
  };

  const removeItem = (criterionIndex, itemIndex) => {
    const updated = [...criteria];

    if (!Array.isArray(updated[criterionIndex].items)) {
      updated[criterionIndex].items = [defaultItem(1)];
    }

    updated[criterionIndex].items = updated[criterionIndex].items.filter(
      (_, index) => index !== itemIndex
    );

    if (updated[criterionIndex].items.length === 0) {
      updated[criterionIndex].items.push(defaultItem(1));
    }

    setCriteria(updated);
  };

  const updateItemRatingField = (
    criterionIndex,
    itemIndex,
    ratingIndex,
    field,
    value
  ) => {
    const updated = [...criteria];

    if (!updated[criterionIndex].items[itemIndex]) {
      updated[criterionIndex].items[itemIndex] = defaultItem(itemIndex + 1);
    }

    if (!Array.isArray(updated[criterionIndex].items[itemIndex].ratings)) {
      updated[criterionIndex].items[itemIndex].ratings = defaultRatings();
    }

    if (!updated[criterionIndex].items[itemIndex].ratings[ratingIndex]) {
      updated[criterionIndex].items[itemIndex].ratings[ratingIndex] = {
        title: "New Rating",
        description: "",
        points: 0,
      };
    }

    updated[criterionIndex].items[itemIndex].ratings[ratingIndex][field] = value;
    setCriteria(updated);
  };

  const addItemRating = (criterionIndex, itemIndex) => {
    const updated = [...criteria];

    if (!updated[criterionIndex].items[itemIndex]) {
      updated[criterionIndex].items[itemIndex] = defaultItem(itemIndex + 1);
    }

    if (!Array.isArray(updated[criterionIndex].items[itemIndex].ratings)) {
      updated[criterionIndex].items[itemIndex].ratings = defaultRatings();
    }

    updated[criterionIndex].items[itemIndex].ratings.push({
      title: "New Rating",
      description: "",
      points: 0,
    });

    setCriteria(updated);
  };

  const removeItemRating = (criterionIndex, itemIndex, ratingIndex) => {
    const updated = [...criteria];

    if (!updated[criterionIndex].items[itemIndex]) return;

    if (!Array.isArray(updated[criterionIndex].items[itemIndex].ratings)) {
      updated[criterionIndex].items[itemIndex].ratings = defaultRatings();
    }

    updated[criterionIndex].items[itemIndex].ratings = updated[
      criterionIndex
    ].items[itemIndex].ratings.filter((_, idx) => idx !== ratingIndex);

    if (updated[criterionIndex].items[itemIndex].ratings.length === 0) {
      updated[criterionIndex].items[itemIndex].ratings = defaultRatings();
    }

    setCriteria(updated);
  };

  const addCriterion = () => {
    setCriteria([...criteria, defaultCriterion(criteria.length + 1)]);
  };

  const removeCriterion = (criterionIndex) => {
    const updated = criteria.filter((_, index) => index !== criterionIndex);
    setCriteria(updated.length ? updated : [defaultCriterion(1)]);
  };

  const totalPoints = criteria.reduce((sum, criterion) => {
    const itemPoints = (criterion.items || []).reduce((itemSum, item) => {
      const maxRating = Math.max(
        ...(item.ratings || []).map((r) => Number(r.points) || 0),
        0
      );
      return itemSum + maxRating;
    }, 0);

    return sum + itemPoints;
  }, 0);

  const handleSubmit = async () => {
    if (!selectedCourse) {
      setMessage("Course сонгоно уу");
      return;
    }

    try {
      const rubricData = {
        title,
        courseId: selectedCourse,
        criteria,
      };

      if (isEditMode) {
        const res = await axios.put(
          `http://127.0.0.1:3001/api/rubrics/${id}`,
          rubricData
        );
        setMessage(res.data.message || "Rubric амжилттай шинэчлэгдлээ");
      } else {
        const res = await axios.post(
          "http://127.0.0.1:3001/api/rubrics",
          rubricData
        );
        setMessage(res.data.message || "Rubric хадгалагдлаа");
      }

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Алдаа гарлаа");
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="page-shell min-h-screen px-6 py-8 text-white">
        <div className="glass-panel mx-auto max-w-4xl p-6">
          Loading rubric...
        </div>
      </div>
    );
  }

  return (
    <LiquidPageShell
      badge={isEditMode ? "Rubric editor" : "Rubric builder"}
      title={isEditMode ? "Edit Rubric" : "Create Rubric"}
      description="Criteria, sub-items, rating scale бүгдийг нэг liquid editor дотор бүтэцлэж байна."
      maxWidth="max-w-7xl"
      headerActions={
        <div className="glass-panel px-6 py-4 text-right">
          <p className="glass-muted text-sm">Total Points</p>
          <p className="text-3xl font-bold text-sky-300">{totalPoints}</p>
        </div>
      }
    >
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="glass-panel p-6">
          <label className="glass-muted mb-2 block text-sm">
            Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="glass-input mb-4"
          >
            <option value="">Course сонгоно уу</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>

          <label className="glass-muted mb-2 block text-sm">
            Rubric Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-input text-2xl font-bold"
          />
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm font-semibold text-sky-100">Builder tips</p>
          <div className="glass-muted mt-3 space-y-3 text-sm">
            <p>Criterion бүрийн доор item-уудаа задлаад rating scale-аа тодорхой өг.</p>
            <p>Drag товчоор шалгуурын дарааллаа өөрчилж болно.</p>
            <p>Save хиймэгц rubric course-той холбогдоно.</p>
          </div>
        </div>
      </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="criteria-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-6"
              >
                {criteria.map((criterion, criterionIndex) => (
                  <Draggable
                    key={`criterion-${criterionIndex}`}
                    draggableId={`criterion-${criterionIndex}`}
                    index={criterionIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="glass-panel p-6"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-slate-100">
                            Шалгуур {criterionIndex + 1}
                          </h2>

                          <button
                            type="button"
                            {...provided.dragHandleProps}
                            className="glass-button-secondary px-3 py-2 text-sm"
                          >
                            ☰ Drag
                          </button>
                        </div>

                        <div className="mb-4">
                          <input
                            type="text"
                            value={criterion.title}
                            onChange={(e) =>
                              updateCriterionField(
                                criterionIndex,
                                "title",
                                e.target.value
                              )
                            }
                            className="glass-input mb-3 font-semibold"
                          />

                          <textarea
                            value={criterion.description}
                            onChange={(e) =>
                              updateCriterionField(
                                criterionIndex,
                                "description",
                                e.target.value
                              )
                            }
                            rows="3"
                            placeholder="Criterion description..."
                            className="glass-input text-sm"
                          />
                        </div>

                        <div className="space-y-4">
                          {(criterion.items || []).map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="glass-card p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <input
                                  value={item.text}
                                  onChange={(e) =>
                                    updateItem(
                                      criterionIndex,
                                      itemIndex,
                                      e.target.value
                                    )
                                  }
                                  className="glass-input"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeItem(criterionIndex, itemIndex)
                                  }
                                  className="glass-button-secondary px-3 py-2 text-sm"
                                >
                                  X
                                </button>
                              </div>

                              <div className="grid gap-3 md:grid-cols-3">
                                {(item.ratings || []).map(
                                  (rating, ratingIndex) => (
                                    <div
                                      key={ratingIndex}
                                      className="glass-card p-3"
                                    >
                                      <input
                                        type="text"
                                        value={rating.title}
                                        onChange={(e) =>
                                          updateItemRatingField(
                                            criterionIndex,
                                            itemIndex,
                                            ratingIndex,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        className="glass-input mb-2"
                                      />

                                      <textarea
                                        value={rating.description}
                                        onChange={(e) =>
                                          updateItemRatingField(
                                            criterionIndex,
                                            itemIndex,
                                            ratingIndex,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        rows="3"
                                        className="glass-input mb-2"
                                      />

                                      <input
                                        type="number"
                                        value={rating.points}
                                        onChange={(e) =>
                                          updateItemRatingField(
                                            criterionIndex,
                                            itemIndex,
                                            ratingIndex,
                                            "points",
                                            Number(e.target.value)
                                          )
                                        }
                                        className="glass-input"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeItemRating(
                                            criterionIndex,
                                            itemIndex,
                                            ratingIndex
                                          )
                                        }
                                        className="glass-button-secondary mt-2 px-3 py-2 text-sm"
                                      >
                                        Remove Rating
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  addItemRating(criterionIndex, itemIndex)
                                }
                                className="glass-button mt-3 px-4 py-2 text-sm"
                              >
                                + Add Rating
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => addItem(criterionIndex)}
                            className="glass-button px-4 py-2 text-sm"
                          >
                            + Add Item
                          </button>

                          <button
                            type="button"
                            onClick={() => removeCriterion(criterionIndex)}
                            className="glass-button-secondary px-4 py-2 text-sm"
                          >
                            Delete Criterion
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addCriterion}
            className="glass-button"
          >
            + Add Criterion
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="glass-button-success"
          >
            {isEditMode ? "Update Rubric" : "Save Rubric"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-sm font-medium text-emerald-300">{message}</p>
        )}
    </LiquidPageShell>
  );
};

export default CreateRubric;
