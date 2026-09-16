import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('classes') + 1];
    const userId = pathSegments[pathSegments.indexOf('users') + 1];

    if (!id || isNaN(Number(id)) || !userId || isNaN(Number(userId))) {
        return NextResponse.json(
            { message: "ID da turma ou do usuário inválido." },
            { status: 400 }
        );
    }

    try {
        // Excluir a relação entre a turma e o usuário na tabela ClassUsers
        const [result] = await pool.query(
            "DELETE FROM ClassUsers WHERE class_id = ? AND user_id = ?",
            [id, userId]
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json(
                { message: "Relação não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Usuário desvinculado da turma com sucesso." },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao desvincular o usuário da turma." },
            { status: 500 }
        );
    }
}