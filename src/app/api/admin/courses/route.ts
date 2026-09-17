import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface CourseRow {
    id: number;
    name: string;
    description: string | null;
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
    const { name, description, price, is_active, cover_image } = body;

    if (!name) {
        return NextResponse.json(
            { message: "O nome do curso é obrigatório." },
            { status: 400 }
        );
    }

    try {
        const [result] = await pool.query<import("mysql2").ResultSetHeader>(
            "INSERT INTO Courses (name, description, price, is_active, cover_image) VALUES (?, ?, ?, ?, ?)",
            [name, description || null, price ?? 0, is_active ?? 1, cover_image || null]
        );

        return NextResponse.json(
            { message: "Curso criado com sucesso!", id: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao criar o curso." },
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

                const validColumns = ["id", "name", "description"];
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

        queryParams.push(Number(limit), offset);

        const validSortColumns = ["id", "name", "description"];
        const sanitizedSortColumn = validSortColumns.includes(sortColumn)
            ? sortColumn
            : "id";

        const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
            ? sortDirection.toLowerCase()
            : "asc";

        const [rows] = await pool.query(
            `
            SELECT
                id,
                name,
                description,
                cover_image,
                COALESCE(price, 0.00) AS price,
                COALESCE(is_active, 1) AS is_active,
                (SELECT COUNT(*) FROM Classes WHERE Classes.course_id = Courses.id) AS class_count
            FROM Courses
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
            FROM Courses
            WHERE ${whereClause}
            `,
            queryParams.slice(0, queryParams.length - 2)
        );

        return NextResponse.json({ 
            courses: rows, 
            total: (totalRows as TotalRow[])[0].total 
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal error fetching courses." }, 
            { status: 500 }
        );
    }
}