import { analyticsSchema } from "@/schema/analytics";
import { model, models } from "mongoose";

const Analytics = models.Analytics || model("Analytics", analyticsSchema);
export default Analytics;
