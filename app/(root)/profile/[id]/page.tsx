import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import Metric from "@/components/Metric";
import { getUser } from "@/lib/actions/user.action";
import { getTimeStamp } from "@/lib/utils";

const ProfilePage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { success, data: user } = await getUser({ userId: id });
  const session = await auth();

  if (!success || !user) return redirect("/404");

  const {
    _id,
    name,
    username,
    image,
    bio,
    location,
    portfolio,
    reputation,
    createdAt,
  } = user;

  const isOwner = session?.user?.id === _id;

  return (
    <div className="flex-start w-full flex-col">
      <div className="flex w-full flex-col-reverse justify-between sm:flex-row">
        <div className="flex items-center justify-start gap-4">
          <UserAvatar
            id={_id}
            name={name}
            imageUrl={image}
            className="size-[140px]"
            fallbackClassName="text-4xl"
          />

          <div>
            <h1 className="h1-bold text-dark300_light700">{name}</h1>
            <p className="paragraph-regular text-dark400_light800">
              @{username}
            </p>

            {bio && (
              <p className="body-regular text-dark400_light800 mt-2">
                {bio}
              </p>
            )}

            {location && (
              <p className="body-regular text-dark400_light800 mt-1 flex items-center gap-1">
                {location}
              </p>
            )}

            {portfolio && (
              <Link
                href={portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="body-regular text-primary-500 mt-1 inline-block"
              >
                {portfolio}
              </Link>
            )}

            <div className="mt-2 flex items-center gap-4">
              <Metric
                imgUrl="/icons/star.svg"
                alt="Reputation"
                value={reputation ?? 0}
                title="reputation"
                textStyles="small-regular text-dark400_light700"
              />
              <Metric
                imgUrl="/icons/clock.svg"
                alt="Joined"
                value={`Joined ${getTimeStamp(new Date(createdAt))}`}
                title=""
                textStyles="small-regular text-dark400_light700"
              />
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="primary-gradient btn mb-4 mt-4 h-10 rounded-lg px-6 py-2 text-light-900">
            Edit Profile
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
