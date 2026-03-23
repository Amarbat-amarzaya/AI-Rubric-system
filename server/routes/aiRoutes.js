require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

console.log("✅ aiRoutes loaded");
console.log("✅ GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

const buildFallbackFeedback = ({
  rubricTitle,
  totalScore,
  totalPoints,
  selectedRatings,
}) => {
  const safeTotalPoints = Number(totalPoints) || 0;
  const safeTotalScore = Number(totalScore) || 0;
  const percentage =
    safeTotalPoints > 0 ? Math.round((safeTotalScore / safeTotalPoints) * 100) : 0;
  const ratedCount = Object.keys(selectedRatings || {}).length;

  let summary = "Гүйцэтгэл хангалттай түвшинд байна.";
  let suggestions = [
    "Шалгуур бүр дээр тайлбар болон нотолгоогоо илүү тодорхой болгоорой.",
    "Дутуу үнэлэгдсэн хэсгүүдэд жишээ, дэлгэрэнгүй тайлбар нэмээрэй.",
    "Ажлаа дахин нягталж бүтэц, ойлгомжтой байдлыг сайжруулаарай.",
  ];
  let closing = "Цаашид бага зэрэг сайжруулалт хийвэл илүү сайн үр дүн гарна.";

  if (percentage >= 85) {
    summary = "Маш сайн гүйцэтгэлтэй, гол шалгууруудыг сайн хангасан байна.";
    suggestions = [
      "Хүчтэй болсон хэсгүүдээ энэ түвшинд хадгалаарай.",
      "Нарийвчлал болон жишээгээ улам баяжуулбал бүр илүү болно.",
      "Дүгнэлт хэсгээ илүү хүчтэй, товч тодорхой болгож болно.",
    ];
    closing = "Сайн ажилласан байна. Энэ чигээрээ үргэлжлүүлээрэй.";
  } else if (percentage >= 60) {
    summary = "Ерөнхийдөө боломжийн гүйцэтгэлтэй боловч сайжруулах хэсэг байна.";
    suggestions = [
      "Оноо бага авсан шалгуур дээрээ агуулгаа дэлгэрүүлээрэй.",
      "Гол санаагаа илүү цэгцтэй, логик дарааллаар илэрхийлээрэй.",
      "Жишээ, тайлбар, баталгааг илүү тодорхой болговол сайн.",
    ];
    closing = "Сайжруулах боломж сайн харагдаж байна. Дахин сайжруулаад үзээрэй.";
  } else if (percentage > 0) {
    summary = "Одоогийн гүйцэтгэлд суурь ойлголт байгаа ч нэлээд сайжруулалт хэрэгтэй байна.";
    suggestions = [
      "Шалгуур бүрийн шаардлагыг нэг бүрчлэн дахин харж ажиллаарай.",
      "Дутуу хариулсан хэсгээ нөхөж, агуулгаа илүү бүрэн болгоорой.",
      "Текстийн бүтэц, тайлбар, жишээгээ илүү ойлгомжтой болгоорой.",
    ];
    closing = "Алхам алхмаар сайжруулбал ахиц гарна. Бүү шантраарай.";
  }

  return [
    `Товч үнэлгээ: "${rubricTitle}" үнэлгээгээр ${safeTotalScore}/${safeTotalPoints} (${percentage}%) оноо авсан байна. Нийт ${ratedCount} шалгуур сонгож үнэлсэн байна. ${summary}`,
    "",
    "Сайжруулах 3 санал:",
    `1. ${suggestions[0]}`,
    `2. ${suggestions[1]}`,
    `3. ${suggestions[2]}`,
    "",
    `Урамшуулсан тэмдэглэл: ${closing}`,
  ].join("\n");
};

router.post("/feedback", async (req, res) => {
  try {
    const { rubricTitle, totalScore, totalPoints, selectedRatings } = req.body;

    if (!rubricTitle || totalScore == null || totalPoints == null) {
      return res.status(400).json({
        message: "rubricTitle, totalScore, totalPoints шаардлагатай",
      });
    }

    if (!groq) {
      return res.status(200).json({
        feedback: buildFallbackFeedback({
          rubricTitle,
          totalScore,
          totalPoints,
          selectedRatings,
        }),
        source: "fallback",
      });
    }

    const prompt = `
You are an educational evaluator.
Respond in Mongolian.

Rubric title: ${rubricTitle}
Student score: ${totalScore} / ${totalPoints}

Selected ratings:
${JSON.stringify(selectedRatings || [], null, 2)}

Give:
1. Short evaluation summary
2. 3 improvement suggestions
3. Encouraging final note

Keep the response concise and clear.
`;

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are a helpful academic evaluation assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const feedback =
      response?.choices?.[0]?.message?.content?.trim() ||
      buildFallbackFeedback({
        rubricTitle,
        totalScore,
        totalPoints,
        selectedRatings,
      });

    return res.status(200).json({ feedback, source: "groq" });
  } catch (error) {
    console.error("FULL GROQ ERROR:", error);

    const { rubricTitle, totalScore, totalPoints, selectedRatings } = req.body;

    return res.status(200).json({
      feedback: buildFallbackFeedback({
        rubricTitle: rubricTitle || "Untitled Rubric",
        totalScore: totalScore || 0,
        totalPoints: totalPoints || 0,
        selectedRatings: selectedRatings || {},
      }),
      source: "fallback",
      warning: error?.message || "Unknown error",
    });
  }
});

module.exports = router;
