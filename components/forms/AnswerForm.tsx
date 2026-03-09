"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { createAnswer } from "@/lib/actions/answer.action";
import { AnswerSchema } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Props {
  questionId: string;
  session: AppSession | null;
}

const AnswerForm = ({
  questionId,
  session,
}: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();

  const editorRef = useRef<MDXEditorMethods>(null);
  const router = useRouter();


  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      });

      if (result.success) {
        form.reset();

        toast("Success", {
          description: "Your answer has been posted successfully",
        });

        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast("Error", {
          description: result.error?.message,
        });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormControl className="mt-3.5">
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <div className="flex justify-end">
              {session ? (
                <Button type="submit" className="primary-gradient w-fit">
                  {isAnswering ? (
                    <>
                      <ReloadIcon className="mr-2 size-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Answer"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="primary-gradient w-fit"
                  onClick={() => router.push(ROUTES.SIGN_IN)}
                >
                  Log in to Answer
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
