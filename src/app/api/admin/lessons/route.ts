import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface LessonRow {
    id: number;
    title: string;
    lesson_description: string | null;
    course_id: number;
    course_name: string;
}

interface TotalRow {
    total: number;
}

interface SearchFilter {
    column: string;
    operator: "equals" | "contains" | "notEquals" | "startsWith";
    term: string;
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { title, lesson_description, course_id } = body;

    // Validação
    if (!title || !course_id) {
        return NextResponse.json(
            { message: "Título e curso são obrigatórios" },
            { status: 400 }
        );
    }

    try {
        // Verificar se o curso existe
        const [courseResult] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM Courses WHERE id = ?",
            [course_id]
        );

        if (courseResult.length === 0) {
            return NextResponse.json(
                { message: "Curso não encontrado" },
                { status: 404 }
            );
        }

        // Inserir nova aula
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO Lessons (title, lesson_description, course_id) VALUES (?, ?, ?)",
            [title, lesson_description || null, course_id]
        );

        return NextResponse.json({
            message: "Aula criada com sucesso",
            lesson_id: result.insertId,
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Erro ao criar aula: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sortColumn = searchParams.get('sortColumn') || 'id';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    const filters = searchParams.get('filters') || '[]';
    const courseId = searchParams.get('courseId');

    const offset = (Number(page) - 1) * Number(limit);

    let searchFilters: SearchFilter[] = [];
    try {
        searchFilters = JSON.parse(filters);
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }

    try {
        let whereClause = "1=1";
        const queryParams: any[] = [];

        if (searchFilters.length > 0) {
            const filterConditions = searchFilters.map((filter) => {
                const column = filter.column;
                let condition = "";

                const validColumns = ["id", "title", "lesson_description", "course_name"];
                if (!validColumns.includes(column)) {
                    return "1=1";
                }

                switch (filter.operator) {
                    case "equals":
                        condition = `${column} = ?`;
                        queryParams.push(filter.term);
                        break;
                    case "notEquals":
                        condition = `${column} != ?`;
                        queryParams.push(filter.term);
                        break;
                    case "contains":
                        condition = `${column} LIKE ?`;
                        queryParams.push(`%${filter.term}%`);
                        break;
                    case "startsWith":
                        condition = `${column} LIKE ?`;
                        queryParams.push(`${filter.term}%`);
                        break;
                    default:
                        condition = "1=1";
                }

                return condition;
            });

            whereClause = filterConditions.join(" AND ");
        }

        if (courseId && !isNaN(Number(courseId))) {
            whereClause = `(${whereClause}) AND Lessons.course_id = ?`;
            queryParams.push(Number(courseId));
        }

        queryParams.push(Number(limit), offset);

        const validSortColumns = ["id", "title", "lesson_description", "course_name"];
        const sanitizedSortColumn = validSortColumns.includes(sortColumn)
            ? sortColumn
            : "id";

        const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
            ? sortDirection.toLowerCase()
            : "asc";

        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                Lessons.id, 
                Lessons.title, 
                Lessons.lesson_description, 
                Lessons.course_id, 
                Courses.name AS course_name
            FROM Lessons
            JOIN Courses ON Lessons.course_id = Courses.id
            WHERE ${whereClause}
            ORDER BY ${sanitizedSortColumn} ${sanitizedSortDirection}
            LIMIT ? OFFSET ?
            `,
            queryParams
        );

        const [totalRows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                COUNT(*) as total 
            FROM Lessons
            JOIN Courses ON Lessons.course_id = Courses.id
            WHERE ${whereClause}
            `,
            queryParams.slice(0, queryParams.length - 2)
        );

        return NextResponse.json({
            lessons: rows,
            total: (totalRows as TotalRow[])[0].total
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal error fetching lessons." },
            { status: 500 }
        );
    }
}