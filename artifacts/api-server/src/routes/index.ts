import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import clubsRouter from "./clubs";
import eventsRouter from "./events";
import announcementsRouter from "./announcements";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(clubsRouter);
router.use(eventsRouter);
router.use(announcementsRouter);
router.use(dashboardRouter);

export default router;
