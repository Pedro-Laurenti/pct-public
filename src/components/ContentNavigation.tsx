import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface AdjacentContent {
  id: number;
  content_type: string;
}

interface Props {
  lessonId: string;
  prevContent: AdjacentContent | null;
  nextContent: AdjacentContent | null;
}

export default function ContentNavigation({ lessonId, prevContent, nextContent }: Props) {
  if (!prevContent && !nextContent) return null;

  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-base-300">
      {prevContent ? (
        <Link
          href={`/dashboard/lessons/${lessonId}/${prevContent.id}/${prevContent.content_type}`}
          className="btn btn-outline btn-sm gap-2"
        >
          <FaChevronLeft size={12} /> Anterior
        </Link>
      ) : (
        <div />
      )}
      {nextContent ? (
        <Link
          href={`/dashboard/lessons/${lessonId}/${nextContent.id}/${nextContent.content_type}`}
          className="btn btn-outline btn-sm gap-2"
        >
          Próximo <FaChevronRight size={12} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
