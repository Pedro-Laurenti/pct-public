import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { sendWelcomeEmail } from "@/lib/email"; // Importando a função de envio de email

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
  classes: string | null;
  courses: string | null;
}

interface TotalRow extends RowDataPacket {
  total: number;
}

interface SearchFilter {
  column: string;
  operator: "equals" | "contains" | "notEquals" | "startsWith";
  term: string;
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { name, email, role, phone_number, hash_url, token, classes } = body;

    try {
        // Criação do usuário
        const [userResult] = await pool.query<ResultSetHeader>(
            "INSERT INTO Users (name, email, role, password_hash, phone_number) VALUES (?, ?, ?, ?, ?)",
            [name, email, role, "", phone_number]
        );

        const userId = userResult.insertId;

        // Inserção na tabela PwdResetTokens
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 5); // Expira em 5 dias
        await pool.query(
            "INSERT INTO PwdResetTokens (user_id, token, hash_url, expires_at) VALUES (?, ?, ?, ?)",
            [userId, token, hash_url, expiresAt]
        );

        // Associação com turmas
        if (role === "student" && Array.isArray(classes) && classes.length > 0) {
            const classUserValues = classes.map((classId: number) => [classId, userId]);
            await pool.query(
                "INSERT INTO ClassUsers (class_id, user_id) VALUES ?",
                [classUserValues]
            );
        }

        // Flag to track email success
        let emailSent = false;
        
        // Enviando email de boas-vindas com instruções para definição de senha
        try {
            emailSent = await sendWelcomeEmail(name, email, hash_url, token);
            if (!emailSent) {
                console.warn(`Email não enviado para ${email}, mas o usuário foi criado com sucesso.`);
            }
        } catch (emailError) {
            console.error("Erro ao enviar email:", emailError);
            // Não interrompemos o fluxo caso o email falhe
        }

        return NextResponse.json({ 
            message: "Usuário criado com sucesso.", 
            id: userId,
            emailSent: emailSent // Inform the client if email was sent
        }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return NextResponse.json(
            { message: "Erro ao criar o usuário." }, 
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
    
    // Parse filters from JSON string
    let searchFilters: SearchFilter[] = [];
    try {
        searchFilters = JSON.parse(filters);
    } catch (error) {
        return NextResponse.json(
            { message: "Error parsing filters" },
            { status: 500 }
        );
    }

    try {
        // Build WHERE clause based on filters
        let whereClause = "1=1"; // Default true condition
        const queryParams: any[] = [];

        if (searchFilters.length > 0) {
            const filterConditions = searchFilters.map(filter => {
                const column = filter.column;
                let condition = "";
                
                // Validate column to prevent SQL injection
                const validColumns = ["id", "name", "email", "role", "created_at"];
                if (!validColumns.includes(column)) {
                    return "1=1"; // Ignore invalid columns
                }
                
                switch (filter.operator) {
                    case "equals":
                        condition = `u.${column} = ?`;
                        queryParams.push(filter.term);
                        break;
                    case "notEquals":
                        condition = `u.${column} != ?`;
                        queryParams.push(filter.term);
                        break;
                    case "contains":
                        condition = `u.${column} LIKE ?`;
                        queryParams.push(`%${filter.term}%`);
                        break;
                    case "startsWith":
                        condition = `u.${column} LIKE ?`;
                        queryParams.push(`${filter.term}%`);
                        break;
                    default:
                        condition = "1=1"; // Default true condition
                }
                
                return condition;
            });
            
            whereClause = filterConditions.join(" AND ");
        }

        // Add params for LIMIT and OFFSET
        queryParams.push(Number(limit), offset);

        // Validate sortColumn to prevent SQL injection
        const validSortColumns = ["id", "name", "email", "role", "created_at"];
        const sanitizedSortColumn = validSortColumns.includes(sortColumn) 
            ? sortColumn 
            : "id";
            
        // Validate sortDirection
        const sanitizedSortDirection = ["asc", "desc"].includes(sortDirection.toLowerCase())
            ? sortDirection.toLowerCase()
            : "asc";

        // Query for users with filters
        const [users] = await pool.query<UserRow[]>(`
            SELECT 
                u.id, u.name, u.email, u.role, u.phone_number, u.created_at, -- Incluído phone_number
                GROUP_CONCAT(DISTINCT c.name) AS classes,
                GROUP_CONCAT(DISTINCT co.name) AS courses
            FROM Users u
            LEFT JOIN ClassUsers cu ON u.id = cu.user_id
            LEFT JOIN Classes c ON cu.class_id = c.id
            LEFT JOIN Courses co ON c.course_id = co.id
            WHERE ${whereClause}
            GROUP BY u.id
            ORDER BY u.${sanitizedSortColumn} ${sanitizedSortDirection}
            LIMIT ? OFFSET ?
            `,
            queryParams
        );

        // Clone the query params for the count query (excluding LIMIT and OFFSET)
        const countQueryParams = queryParams.slice(0, -2);

        // Query for total count with the same filters
        const [totalRows] = await pool.query<TotalRow[]>(`
            SELECT COUNT(*) AS total
            FROM Users u
            WHERE ${whereClause}
            `,
            countQueryParams
        );
        
        const total = totalRows[0]?.total || 0;

        return NextResponse.json({
            users: users.map((user) => ({
                ...user,
                phone_number: user.phone_number || null, // Certifique-se de incluir o phone_number
                classes: user.classes ? user.classes.split(",") : [],
                courses: user.courses ? user.courses.split(",") : [],
            })),
            total,
        });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return NextResponse.json(
            { message: "Internal server error" }, 
            { status: 500 }
        );
    }
}