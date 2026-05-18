"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileSchema } from "@/lib/validations";
import { updateUser } from "@/lib/actions/user.action";
import { toast } from "sonner";

interface ProfileFormProps {
  user: User;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      location: user.location || "",
      portfolio: user.portfolio || "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof ProfileSchema>) => {
    startTransition(async () => {
      const result = await updateUser(data);

      if (result.success) {
        toast("Profile updated", {
          description: "Your profile has been updated successfully.",
        });
        router.push(ROUTES.PROFILE(user._id));
      } else {
        toast("Update failed", {
          description: result.error?.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-10 flex w-full flex-col gap-7"
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Bio
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="portfolio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Portfolio URL
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-7 flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary text-dark300_light900 min-h-[46px] w-full rounded-lg px-4 py-3 shadow-none sm:w-36"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="primary-gradient text-light-900 min-h-[46px] w-full rounded-lg px-4 py-3 shadow-none sm:w-36"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
