import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { getCachedQuestion } from "@/lib/data/questions";
import ROUTES from "@/constants/routes";

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect("/sign-in");

  let question: Question;
  try {
    question = await getCachedQuestion(id);
  } catch {
    return notFound();
  }

  const authorId = question.author._id.toString();

  if (authorId !== session?.user?.id)
    redirect(ROUTES.QUESTION(id));

  return (
    <main>
      <QuestionForm question={question} isEdit />
    </main>
  );
};

export default EditQuestion;