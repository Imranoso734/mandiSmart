import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { ExpenseController } from "./expenseController"

export const ExpenseRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate] }, ExpenseController.list)
  app.get("/:id", { preHandler: [authenticate] }, ExpenseController.getById)
  app.post("/", { preHandler: [authenticate] }, ExpenseController.create)
  app.put("/:id", { preHandler: [authenticate] }, ExpenseController.update)
  app.delete("/:id", { preHandler: [authenticate] }, ExpenseController.remove)
  next()
}
