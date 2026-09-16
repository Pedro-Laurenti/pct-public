import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface CourseRow {
    id: number;
    name: string;
    description: string;
}

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('courses') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID do curso inválido." }, 
            { status: 400 }
        );
    }
    
    try {
        // Buscar dados do curso
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id, name, description FROM Courses WHERE id = ?",
            [id]
        );
        const courseRows = rows as CourseRow[];

        if (courseRows.length === 0) {
            return NextResponse.json(
                { message: "Curso não encontrado." }, 
                { status: 404 }
            );
        }

        return NextResponse.json(courseRows[0]);
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao buscar dados do curso." }, 
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('courses') + 1];
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
        return NextResponse.json({ message: "O nome do curso é obrigatório." }, { status: 400 });
    }

    try {
        // Atualizar dados do curso
        const [result] = await pool.query(
            "UPDATE Courses SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: "Curso não encontrado." }, { status: 404 });
        }

        return NextResponse.json({ message: "Curso atualizado com sucesso." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro interno ao atualizar o curso." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('courses') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID do curso inválido." }, 
            { status: 400 }
        );
    }

    try {
        // Check if course exists first
        const [checkRows] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM Courses WHERE id = ?",
            [id]
        );

        if (checkRows.length === 0) {
            return NextResponse.json(
                { message: "Curso não encontrado." }, 
                { status: 404 }
            );
        }

        // Delete the course
        const [result] = await pool.query(
            "DELETE FROM Courses WHERE id = ?",
            [id]
        );

        return NextResponse.json(
            { message: "Curso excluído com sucesso." }, 
            { status: 200 }
        );
    } catch (error) {
        // Check if it's a foreign key constraint error
        if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
            return NextResponse.json(
                { message: "Não é possível excluir o curso pois existem classes associadas a ele." }, 
                { status: 409 }
            );
        }
        
        return NextResponse.json(
            { message: "Erro interno ao excluir o curso." }, 
            { status: 500 }
        );
    }
}