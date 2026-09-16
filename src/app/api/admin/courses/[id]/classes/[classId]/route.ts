import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('courses') + 1];
    const classId = pathSegments[pathSegments.indexOf('classes') + 1];

    if (!id || isNaN(Number(id)) || !classId || isNaN(Number(classId))) {
        return NextResponse.json(
            { message: "ID do curso ou da turma inválido." }, 
            { status: 400 }
        );
    }    try {
        // Atualiza a turma para desvinculá-la do curso
        const [result] = await pool.query(
            "UPDATE Classes SET course_id = NULL WHERE id = ? AND course_id = ?",
            [classId, id]
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json(
                { message: "Turma não encontrada ou já desvinculada." }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Turma desvinculada do curso com sucesso." });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao desvincular turma." }, 
            { status: 500 }
        );
    }
}