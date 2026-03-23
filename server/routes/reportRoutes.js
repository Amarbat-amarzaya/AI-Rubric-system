const express = require("express");
const ExcelJS = require("exceljs");
const Evaluation = require("../models/Evaluation");

const router = express.Router();

router.get("/excel", async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate("courseId", "courseCode courseName")
      .populate("evaluatorId", "name email role")
      .populate("teacherId", "name email")
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();

    // =========================
    // Sheet 1: All Evaluations
    // =========================
    const allSheet = workbook.addWorksheet("All Evaluations");

    allSheet.columns = [
      { header: "№", key: "no", width: 6 },
      { header: "Хичээлийн код", key: "courseCode", width: 18 },
      { header: "Хичээлийн нэр", key: "courseName", width: 24 },
      { header: "Үнэлсэн хэрэглэгч", key: "evaluatorName", width: 24 },
      { header: "Role", key: "evaluatorRole", width: 14 },
      { header: "Багш", key: "teacherName", width: 20 },
      { header: "Нийт оноо", key: "totalScore", width: 12 },
      { header: "Огноо", key: "createdAt", width: 18 },
    ];

    evaluations.forEach((item, index) => {
      allSheet.addRow({
        no: index + 1,
        courseCode: item.courseId?.courseCode || "-",
        courseName: item.courseId?.courseName || "-",
        evaluatorName: item.evaluatorId?.name || "-",
        evaluatorRole: item.evaluatorRole || "-",
        teacherName: item.teacherId?.name || "-",
        totalScore: item.totalScore || 0,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      });
    });

    // Header style
    allSheet.getRow(1).font = { bold: true };
    allSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F28C28" },
    };

    // =========================
    // Sheet 2: Course Summary
    // =========================
    const courseSheet = workbook.addWorksheet("Course Summary");

    courseSheet.columns = [
      { header: "№", key: "no", width: 6 },
      { header: "Хичээлийн код", key: "courseCode", width: 18 },
      { header: "Хичээлийн нэр", key: "courseName", width: 24 },
      { header: "Үнэлгээний тоо", key: "count", width: 16 },
      { header: "Дундаж оноо", key: "avgScore", width: 16 },
    ];

    const courseMap = {};

    evaluations.forEach((item) => {
      const key = item.courseId?._id?.toString() || "unknown";

      if (!courseMap[key]) {
        courseMap[key] = {
          courseCode: item.courseId?.courseCode || "-",
          courseName: item.courseId?.courseName || "-",
          totalScore: 0,
          count: 0,
        };
      }

      courseMap[key].totalScore += item.totalScore || 0;
      courseMap[key].count += 1;
    });

    Object.values(courseMap).forEach((course, index) => {
      courseSheet.addRow({
        no: index + 1,
        courseCode: course.courseCode,
        courseName: course.courseName,
        count: course.count,
        avgScore:
          course.count > 0
            ? Number((course.totalScore / course.count).toFixed(1))
            : 0,
      });
    });

    courseSheet.getRow(1).font = { bold: true };
    courseSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F28C28" },
    };

    // =========================
    // Sheet 3: Teacher Summary
    // =========================
    const teacherSheet = workbook.addWorksheet("Teacher Summary");

    teacherSheet.columns = [
      { header: "№", key: "no", width: 6 },
      { header: "Багш", key: "teacherName", width: 20 },
      { header: "Хичээлийн код", key: "courseCode", width: 18 },
      { header: "Үнэлгээний тоо", key: "count", width: 16 },
      { header: "Дундаж оноо", key: "avgScore", width: 16 },
    ];

    const teacherMap = {};

    evaluations.forEach((item) => {
      const teacherName = item.teacherId?.name || "Unknown";
      const courseCode = item.courseId?.courseCode || "-";
      const key = `${teacherName}-${courseCode}`;

      if (!teacherMap[key]) {
        teacherMap[key] = {
          teacherName,
          courseCode,
          totalScore: 0,
          count: 0,
        };
      }

      teacherMap[key].totalScore += item.totalScore || 0;
      teacherMap[key].count += 1;
    });

    Object.values(teacherMap).forEach((item, index) => {
      teacherSheet.addRow({
        no: index + 1,
        teacherName: item.teacherName,
        courseCode: item.courseCode,
        count: item.count,
        avgScore:
          item.count > 0
            ? Number((item.totalScore / item.count).toFixed(1))
            : 0,
      });
    });

    teacherSheet.getRow(1).font = { bold: true };
    teacherSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F28C28" },
    };

    // border style бүх sheet дээр
    [allSheet, courseSheet, teacherSheet].forEach((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=evaluation-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log("EXCEL REPORT ERROR:", error);
    res.status(500).json({
      message: "Excel report үүсгэх үед алдаа гарлаа",
      error: error.message,
    });
  }
});

module.exports = router;