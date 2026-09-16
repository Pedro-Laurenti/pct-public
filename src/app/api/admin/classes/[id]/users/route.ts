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

    try {
        let whereClause = "ClassUsers.class_id = ?";
        const queryParams: any[] = [id];

        if (searchFilters.length > 0) {
            const filterConditions = searchFilters.map((filter) => {
                const column = filter.column;
                let condition = "";

                const validColumns = ["id", "name", "email", "role", "phone_number"];
                if (!validColumns.includes(column)) {
                    return "1=1";
                }

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

        queryParams.push(Number(limit), offset);

        const validSortColumns = ["id", "name", "email", "role", "phone_number"];
        const sanitizedSortColumn = validSortColumns.includes(sortColumn)
            ? `Users.${sortColumn}`
            : "Users.id";

        const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
            ? sortDirection.toLowerCase()
            : "asc";

        const [rows] = await pool.query(
            `
            SELECT 
                Users.id,
                Users.name,
                Users.email,
                Users.role,
                Users.phone_number
            FROM ClassUsers
            INNER JOIN Users ON ClassUsers.user_id = Users.id
            WHERE ${whereClause}
            ORDER BY ${sanitizedSortColumn} ${sanitizedSortDirection}
            LIMIT ? OFFSET ?
            `,
            queryParams
        );

        const [totalRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM ClassUsers
            INNER JOIN Users ON ClassUsers.user_id = Users.id
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