import cors from "cors";
import express from "express";
import { AdminModuleConfig } from "./src/modules/admin/infrastructure/config/AdminModuleConfig";
import { AuthModuleConfig } from "./src/modules/auth/infrastructure/config/AuthModuleConfig";
import { EleveModuleConfig } from "./src/modules/eleve/infrastructure/config/EleveModuleConfig";
import { VigilModuleConfig } from "./src/modules/vigil/infrastructure/config/VigilModuleConfig";
import { academicRouter } from "./src/routes/academic";
import { candidaturesRouter } from "./src/routes/candidatures";
import { collaborationRouter } from "./src/routes/collaboration";
import { interopAdminRouter } from "./src/routes/interopAdmin";
import { interopSecurityRouter } from "./src/routes/interopSecurity";
import { interopStudentProfRouter } from "./src/routes/interopStudentProf";
import { planningRouter } from "./src/routes/planning";
import { professorCoursesRouter } from "./src/routes/professorCourses";
import { professorScheduleRouter } from "./src/routes/professorSchedule";
import { syncRouter } from "./src/routes/sync";
import { tutorRouter } from "./src/routes/tutor";
import { uploadRouter } from "./src/routes/upload";
import { syncFromPostgres } from "./src/db";
import { studentRouter } from "./src/studentRouter";

async function startServer() {
  await syncFromPostgres();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  // CORS — autorise le frontend Vite en dev
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));

  // Payload limit pour les uploads base64
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Logging API uniquement
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`[École 221] ${req.method} ${req.url}`);
    }
    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Modules DDD
  app.use("/api", AuthModuleConfig.bootstrap());
  app.use("/api", VigilModuleConfig.bootstrap());
  app.use("/api", EleveModuleConfig.bootstrap());
  app.use("/api", AdminModuleConfig.bootstrap());

  // Routers
  app.use("/api", academicRouter);
  app.use("/api/student", academicRouter);
  app.use("/api", professorCoursesRouter);
  app.use("/api", professorScheduleRouter);
  app.use("/api", candidaturesRouter);
  app.use("/api", uploadRouter);
  app.use("/api", interopAdminRouter);
  app.use("/api", interopSecurityRouter);
  app.use("/api", interopStudentProfRouter);
  app.use("/api", tutorRouter);
  app.use("/api", planningRouter);
  app.use("/api", collaborationRouter);
  app.use("/api", syncRouter);
  app.use("/api/student", studentRouter);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[École 221 Backend] ✅ http://localhost:${PORT}`);
    console.log(`[École 221 Backend] CORS autorisé pour : ${FRONTEND_URL}`);
  });
}

startServer();
