import e, {json} from "express";
import {router} from "./router.js";

export const app = e()
app.use(json())
app.use(router)
