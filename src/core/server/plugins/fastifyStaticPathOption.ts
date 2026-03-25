import { FastifyStaticOptions } from "@fastify/static"
import { FastifyRegisterOptions } from "fastify"
import path from "node:path"

type Options = FastifyRegisterOptions<FastifyStaticOptions>

export const FastifyStaticPathOptions: Options = {
  root: path.join(process.cwd(), "public"),
  prefix: "/public/",
}