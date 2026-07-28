import { Router } from "express";
import { profileRouter } from "./routes/profile";
import { attendanceRouter } from "./routes/attendance";
import { homeworkRouter } from "./routes/homework";
import { liveRouter } from "./routes/live";
import { liveInteractionsRouter } from "./routes/liveInteractions";
import { coursesRouter } from "./routes/courses";
import { tutorRouter } from "./routes/tutor";

export const studentRouter = Router();

// Hook up all student feature-specific endpoint sub-routers
studentRouter.use(profileRouter);
studentRouter.use(attendanceRouter);
studentRouter.use(homeworkRouter);
studentRouter.use(liveRouter);
studentRouter.use(liveInteractionsRouter);
studentRouter.use(coursesRouter);
studentRouter.use(tutorRouter);

studentRouter.get("/performance", (req, res) => {
  res.json([
    { mois: 'Janvier', note: 14.2, presence: 92, promoMoy: 13.8 },
    { mois: 'Février', note: 15.5, presence: 95, promoMoy: 13.8 },
    { mois: 'Mars', note: 16.3, presence: 98, promoMoy: 13.8 },
    { mois: 'Avril', note: 15.8, presence: 94, promoMoy: 13.8 },
    { mois: 'Mai', note: 16.89, presence: 96, promoMoy: 13.8 }
  ]);
});
