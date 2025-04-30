"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingOrError from "@/components/LoadingOrError";

export default function ContentRedirect() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentType = async () => {
      if (!params) {
        setError("Parâmetros não encontrados");
        setLoading(false);
        return;
      }
      const lessonId = params.id as string;
      const contentId = params.contentId as string;

      try {
        const response = await fetch(`/api/lessons/${lessonId}/${contentId}`);
        if (!response.ok) {
          throw new Error("Falha ao carregar informações do conteúdo");
        }
        
        const data = await response.json();
        
        // Redirecionar para o tipo específico de conteúdo
        if (data.content && data.content.content_type) {
          router.push(`/dashboard/lessons/${lessonId}/${contentId}/${data.content.content_type}`);
        } else {
          throw new Error("Tipo de conteúdo não identificado");
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (params && params.id && params.contentId) {
      fetchContentType();
    }
  }, [params, router]);

  if (!loading && error) {
    return <LoadingOrError loading={false} error={error} />;
  }

  return <LoadingOrError loading={true} error={null} />;
}