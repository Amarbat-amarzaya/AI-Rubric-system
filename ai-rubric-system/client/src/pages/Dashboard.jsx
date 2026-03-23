import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LiquidPageShell from "../components/LiquidPageShell";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalSubmissions: 0,
    evaluatedSubmissions: 0,
    averageScore: 0,
    rubricStats: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:3001/api/submissions/analytics/summary"
        );
        setAnalytics(res.data);
      } catch (error) {
        console.log("FETCH ANALYTICS ERROR:", error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <LiquidPageShell
      badge="Insights"
      title="Dashboard Analytics"
      description="Submission volume, evaluation progress, rubric performance-г нэг дороос харна."
      maxWidth="max-w-7xl"
    >

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="glass-card glass-interactive p-6">
            <p className="glass-muted text-sm">Total Submissions</p>
            <p className="mt-2 text-3xl font-bold text-sky-300">
              {analytics.totalSubmissions}
            </p>
          </div>

          <div className="glass-card glass-interactive p-6">
            <p className="glass-muted text-sm">Evaluated Submissions</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {analytics.evaluatedSubmissions}
            </p>
          </div>

          <div className="glass-card glass-interactive p-6">
            <p className="glass-muted text-sm">Average Score</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {analytics.averageScore}
            </p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Rubric Performance Chart
          </h2>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.rubricStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="rubric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="submissions" name="Submissions" />
                <Bar dataKey="averageScore" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel mt-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Rubric Summary</h2>

          <div className="space-y-4">
            {analytics.rubricStats.length === 0 ? (
              <p className="glass-muted">Одоогоор analytics data алга.</p>
            ) : (
              analytics.rubricStats.map((item, index) => (
                <div
                  key={index}
                  className="glass-card glass-interactive flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-semibold">{item.rubric}</p>
                    <p className="glass-muted text-sm">
                      Submissions: {item.submissions}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="glass-muted text-sm">Average Score</p>
                    <p className="text-lg font-bold text-sky-300">
                      {item.averageScore}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </LiquidPageShell>
  );
};

export default Dashboard;
