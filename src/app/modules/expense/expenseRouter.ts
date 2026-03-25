import { FastifyPlugin } from "@/core/server/plugins"
import { authenticate } from "@/core/server/middleware/authenticate"
import { IdParamsSchema } from "../shared/schema"
import { ExpenseController } from "./expenseController"
import { CreateExpenseSchema, ListExpenseQuerySchema, UpdateExpenseSchema } from "./expenseSchema"

export const ExpenseRouter: FastifyPlugin = (app, _opts, next) => {
  app.get("/", { preHandler: [authenticate], schema: { querystring: ListExpenseQuerySchema } }, ExpenseController.list)
  app.get("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ExpenseController.getById)
  app.post("/", { preHandler: [authenticate], schema: { body: CreateExpenseSchema } }, ExpenseController.create)
  app.put("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema, body: UpdateExpenseSchema } }, ExpenseController.update)
  app.delete("/:id", { preHandler: [authenticate], schema: { params: IdParamsSchema } }, ExpenseController.remove)
  next()
}
