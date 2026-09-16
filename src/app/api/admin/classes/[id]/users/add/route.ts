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
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sortColumn = searchParams.get('sortColumn') || 'id';
    const sortDirection = searchParams.get('sortDirection') || 'asc';
    const filters = searchParams.get('filters') || '[]';

    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ message: "ID da turma inválido." }, { status: 400 });
    }

    const offset = (Number(page) - 1) * Number(limit);

    let searchFilters: SearchFilter[] = [];
    try {
        searchFilters = JSON.parse(filters);
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 });
    }

    const validSortColumns = ["id", "name", "email", "role", "phone_number"];
    const sanitizedSortColumn = validSortColumns.includes(sortColumn)
        ? sortColumn
        : "id";

    const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
        ? sortDirection.toLowerCase()
        : "asc";

    try {
        let whereClause = "id NOT IN (SELECT user_id FROM ClassUsers WHERE class_id = ?)";
        const queryParams: any[] = [id];

        if (searchFilters.length > 0) {
            const filterConditions = searchFilters.map((filter) => {
                const column = filter.column;
                let condition = "";

                const validColumns = ["id", "name", "email", "role", "phone_number"];
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

            whereClause += " AND " + filterConditions.join(" AND ");
        }

        queryParams.push(Number(limit), offset);

        const [rows] = await pool.query(
            `
            SELECT id, name, email, role, phone_number
            FROM Users
            WHERE ${whereClause}
            ORDER BY ${sanitizedSortColumn} ${sanitizedSortDirection}
            LIMIT ? OFFSET ?
            `,
            queryParams
        );

        const [totalRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM Users
            WHERE ${whereClause}
            `,
            queryParams.slice(0, -2)
        );

        const total = (totalRows as RowDataPacket[])[0]?.total || 0;

        return NextResponse.json({ users: rows, total }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao buscar usuários." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('classes') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json({ message: "ID da turma inválido." }, { status: 400 });
    }
    
    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.some((userId) => isNaN(Number(userId)))) {
        return NextResponse.json(
            { message: "IDs de usuários inválidos." },
            { status: 400 }
        );
    }

    try {
        const values = userIds.map((userId) => [id, userId]);
        await pool.query(
            `
            INSERT INTO ClassUsers (class_id, user_id)
            VALUES ? 
            `,
            [values]
        );

        return NextResponse.json(
            { message: "Usuários adicionados à turma com sucesso." },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro interno ao adicionar usuários à turma." },
            { status: 500 }
        );
    }
}