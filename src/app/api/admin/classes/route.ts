import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface ClassRow {
    id: number;
    name: string;
    course_name: string | null;
    student_count: number;
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
    const { name, course_id } = body;

    if (!name || !course_id) {
        return NextResponse.json({ message: "Nome e curso são obrigatórios." }, { status: 400 });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO Classes (name, course_id) VALUES (?, ?)",
            [name, course_id]
        );

        return NextResponse.json(
            { message: "Turma criada com sucesso!", id: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao criar a turma." },
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

                const validColumns = ["id", "name", "course_name"];
                if (!validColumns.includes(column)) {
                    return "1=1";
                }

                // Prefixar o alias correto para cada coluna
                const columnPrefix =
                    column === "name"
                        ? "Classes.name" // `name` pertence à tabela `Classes`
                        : column === "course_name"
                        ? "Courses.name" // `course_name` pertence à tabela `Courses`
                        : `Classes.${column}`; // Outras colunas pertencem à tabela `Classes`

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

            whereClause = filterConditions.join(" AND ");
        }

        queryParams.push(Number(limit), offset);

        const validSortColumns = ["id", "name", "course_name", "student_count"];
        const sanitizedSortColumn = validSortColumns.includes(sortColumn)
            ? (sortColumn === "name" ? "Classes.name" : sortColumn) // Prefixar `Classes.name` no ORDER BY
            : "id";

        const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
            ? sortDirection.toLowerCase()
            : "asc";

        const [rows] = await pool.query(
            `
            SELECT
                Classes.id,
                Classes.name,
                Classes.course_id,
                Courses.name AS course_name,
                COUNT(ClassUsers.user_id) AS student_count
            FROM Classes
            LEFT JOIN Courses ON Classes.course_id = Courses.id
            LEFT JOIN ClassUsers ON Classes.id = ClassUsers.class_id
            WHERE ${whereClause}
            GROUP BY Classes.id, Classes.name, Classes.course_id, Courses.name
            ORDER BY ${sanitizedSortColumn} ${sanitizedSortDirection}
            LIMIT ? OFFSET ?
            `,
            queryParams
        );

        const classes: ClassRow[] = rows as ClassRow[];
        const countQueryParams = queryParams.slice(0, -2);

        const [totalRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM Classes
            LEFT JOIN Courses ON Classes.course_id = Courses.id
            WHERE ${whereClause}
            `,
            countQueryParams
        );

        const total = (totalRows as RowDataPacket[])[0]?.total || 0;

        return NextResponse.json({ classes, total }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}