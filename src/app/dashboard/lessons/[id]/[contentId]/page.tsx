"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ContentRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const lessonId = params?.id as string;
    const contentId = params?.contentId as string;

    if (!lessonId || !contentId) return;

    fetch(`/api/lessons/${lessonId}/${contentId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.content?.content_type) {
          router.replace(
            `/dashboard/lessons/${lessonId}/${contentId}/${data.content.content_type}`
          );
        }
      })
      .catch(() => {
        router.replace(`/dashboard/lessons/${lessonId}`);
      });
  }, [params, router]);

  return (
    <div className="flex justify-center items-center h-full min-h-48">
      <span className="loading loading-ring loading-xl" />
    </div>
  );
}
