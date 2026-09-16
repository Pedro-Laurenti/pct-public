// ESSE FUNCIONA, UTILIZAR COMO BASE PARA AS OUTRAS ROTAS

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface SearchFilter {
    column: string;
    operator: "equals" | "contains" | "notEquals" | "startsWith";
    term: string;
}

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('classes') + 1];
    
    const searchParams = request.nextUrl.searchParams;
    const filters = searchParams.get('filters') || '[]';

    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ message: "ID da turma inválido." }, { status: 400 });
    }

    let searchFilters: SearchFilter[] = [];
    try {
        searchFilters = JSON.parse(filters);
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }

    // Rest of your existing GET function implementation
    try {
        // Primeiro buscar os dados básicos da turma
        const [classRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT c.id, c.name, c.course_id, co.name as course_name
            FROM Classes c
            LEFT JOIN Courses co ON c.course_id = co.id
            WHERE c.id = ?
            `,
            [id]
        );

        // ...rest of your existing implementation
        if (!Array.isArray(classRows) || classRows.length === 0) {
            return NextResponse.json({ message: "Turma não encontrada." }, { status: 404 });
        }

        const classData = classRows[0] as RowDataPacket;

        // Agora buscar os alunos matriculados
        let whereClause = "ClassUsers.class_id = ?";
        const queryParams: any[] = [id];

        if (searchFilters.length > 0) {
            // ...existing filter implementation
            const filterConditions = searchFilters.map((filter) => {
                const column = filter.column;
                let condition = "";

                const validColumns = ["id", "name", "email"];
                if (!validColumns.includes(column)) {
                    return "1=1";
                }

                // Prefixar o alias correto para cada coluna
                const columnPrefix = `Users.${column}`;

                switch (filter.operator) {
                    case "equals":
                        condition = `${columnPrefix} = ?`;
                        queryParams.push(filter.term);
                        break;
                    case "notEquals":
                        condition = `${columnPrefix} != ?`;
                        queryParams.push(filter.term);
                        break;
                    case "contains":
                        condition = `${columnPrefix} LIKE ?`;
                        queryParams.push(`%${filter.term}%`);
                        break;
                    case "startsWith":
                        condition = `${columnPrefix} LIKE ?`;
                        queryParams.push(`${filter.term}%`);
                        break;
                    default:
                        condition = "1=1";
                }

                return condition;
            });

            whereClause += " AND " + filterConditions.join(" AND ");
        }

        // Buscar alunos matriculados na turma com filtros aplicados
        const [studentRows] = await pool.query(
            `
            SELECT Users.id, Users.name, Users.email
            FROM ClassUsers
            INNER JOIN Users ON ClassUsers.user_id = Users.id
            WHERE ${whereClause}
            `,
            queryParams
        );

        return NextResponse.json({
            id: classData.id,
            name: classData.name,
            course_id: classData.course_id,
            course_name: classData.course_name,
            students: studentRows,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Erro interno ao buscar dados da turma." },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('classes') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ message: "ID da turma inválido." }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, course_id } = body;

    if (!name || !course_id) {
        return NextResponse.json(
            { message: "Nome e curso são obrigatórios." },
            { status: 400 }
        );
    }

    // Rest of your existing PUT function implementation
    try {
        // Atualizar dados da turma
        const [result] = await pool.query(
            "UPDATE Classes SET name = ?, course_id = ? WHERE id = ?",
            [name, course_id, id]
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json(
                { message: "Turma não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Turma atualizada com sucesso." }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao atualizar a turma." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('classes') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ message: "ID da turma inválido." }, { status: 400 });
    }
    
    // Rest of your existing DELETE function implementation
    try {
        const [result] = await pool.query("DELETE FROM Classes WHERE id = ?", [id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json(
                { message: "Turma não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Turma excluída com sucesso." }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao excluir a turma." },
            { status: 500 }
        );
    }
}