"use server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

type ActionSuccess<T> = {
  success: true;
  params: T | undefined;
  session: Session | null;
};

type ActionFailure = {
  success: false;
  error: Error;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

async function action<T>(
  { params, schema, authorize = false }: ActionOptions<T>
): Promise<ActionResult<T>> {
  if (schema) {
    try {
      params = schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: new ValidationError(
            error.flatten().fieldErrors as Record<string, string[]>
          ),
        };
      } else {
        return { success: false, error: new Error("Schema validation failed") };
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) {
      return { success: false, error: new UnauthorizedError() };
    }
  }

  await dbConnect();

  return { success: true, params, session };
}

export default action;
