import { FastifyPlugin } from "@/core/server/plugins"
import { HealthCheckRouter } from "./modules/healthCheck/healthCheckRouter"
import { AuthRouter } from "./modules/auth/authRouter"
import { TenantRouter } from "./modules/tenant/tenantRouter"
import { UserRouter } from "./modules/user/userRouter"
import { CustomerRouter } from "./modules/customer/customerRouter"
import { SupplierRouter } from "./modules/supplier/supplierRouter"
import { ConsignmentRouter } from "./modules/consignment/consignmentRouter"
import { SaleRouter } from "./modules/sale/saleRouter"
import { PaymentRouter } from "./modules/payment/paymentRouter"
import { ExpenseRouter } from "./modules/expense/expenseRouter"
import { ReportRouter } from "./modules/reporting/reportRouter"

/**
 * Yahan saare MandiSmart routers register hote hain.
 */
export const routers = new Map<string, FastifyPlugin>([
  ["/api/v1/health-check", HealthCheckRouter],
  ["/api/v1/auth", AuthRouter],
  ["/api/v1/tenant", TenantRouter],
  ["/api/v1/users", UserRouter],
  ["/api/v1/customers", CustomerRouter],
  ["/api/v1/suppliers", SupplierRouter],
  ["/api/v1/consignments", ConsignmentRouter],
  ["/api/v1/sales", SaleRouter],
  ["/api/v1/payments", PaymentRouter],
  ["/api/v1/expenses", ExpenseRouter],
  ["/api/v1/reports", ReportRouter],
])
