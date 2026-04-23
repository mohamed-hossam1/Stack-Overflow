import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import ProfileForm from "@/components/forms/ProfileForm";
import { getCachedUser } from "@/lib/data/users";

const EditProfilePage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const session = await auth();

  if (!session) return redirect("/sign-in");

  if (session.user?.id !== id) return redirect(`/profile/${id}`);

  let user: User;
  try {
    user = await getCachedUser(id);
  } catch {
    return redirect("/404");
  }

  return (
    <div className="flex-start w-full flex-col">
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <ProfileForm user={user} />
    </div>
  );
};

export default EditProfilePage;
