import { useEffect, useState } from "react";
import axios from "axios";
import LiquidPageShell from "../components/LiquidPageShell";

const UploadAssignment = () => {
  const [studentName, setStudentName] = useState("");
  const [rubrics, setRubrics] = useState([]);
  const [selectedRubric, setSelectedRubric] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:3001/api/rubrics");
      setRubrics(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentName || !selectedRubric || !file) {
      setMessage("Бүх талбарыг бөглөнө үү");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("studentName", studentName);
      formData.append("rubricId", selectedRubric);
      formData.append("file", file);

      const res = await axios.post(
        "http://127.0.0.1:3001/api/submissions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message);
      setStudentName("");
      setSelectedRubric("");
      setFile(null);

      const fileInput = document.getElementById("assignment-file");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Файл оруулах үед алдаа гарлаа"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidPageShell
      badge="Submission flow"
      title="Upload Assignment"
      description="Файлаа rubric-тэй холбож оруулаад review queue руу шууд илгээнэ."
      maxWidth="max-w-4xl"
    >
      <form
        onSubmit={handleSubmit}
        className="glass-panel space-y-5 p-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-card glass-interactive p-4">
            <p className="text-sm font-semibold text-sky-100">1. Student info</p>
            <p className="glass-muted mt-2 text-sm">
              Нэрээ оруулж submission-ээ танигдах байдлаар илгээнэ.
            </p>
          </div>
          <div className="glass-card glass-interactive p-4">
            <p className="text-sm font-semibold text-sky-100">2. Pick rubric</p>
            <p className="glass-muted mt-2 text-sm">
              Үнэлэх rubric-аа сонгоод зөв урсгалд холбоно.
            </p>
          </div>
          <div className="glass-card glass-interactive p-4">
            <p className="text-sm font-semibold text-sky-100">3. Upload file</p>
            <p className="glass-muted mt-2 text-sm">
              Файлаа оруулаад review багт илгээнэ.
            </p>
          </div>
        </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Student name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Amraa"
              className="glass-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Select rubric
            </label>
            <select
              value={selectedRubric}
              onChange={(e) => setSelectedRubric(e.target.value)}
              className="glass-input"
            >
              <option value="">Rubric сонгоно уу</option>
              {rubrics.map((rubric) => (
                <option key={rubric._id} value={rubric._id}>
                  {rubric.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">
              Upload file
            </label>
            <input
              id="assignment-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="glass-input"
            />
            {file && (
              <p className="glass-muted mt-2 text-sm">
                Selected: {file.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-button-success disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Submit Assignment"}
          </button>

          {message && (
            <p className="text-sm font-medium text-emerald-300">{message}</p>
          )}
      </form>
    </LiquidPageShell>
  );
};

export default UploadAssignment;
