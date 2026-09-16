import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { sendWelcomeEmail } from "@/lib/email"; // Importando a função de envio de email

export async function GET(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('users') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID inválido." },
            { status: 400 }
        );
    }

    try {
        const [user] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM Users WHERE id = ?",
            [id]
        );

        if (!user || user.length === 0) {
            return NextResponse.json(
                { message: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        const [classes] = await pool.query<RowDataPacket[]>(
            "SELECT class_id FROM ClassUsers WHERE user_id = ?",
            [id]
        );

        // Verificar se existe um hashUrl e token válidos
        const [tokenData] = await pool.query<RowDataPacket[]>(
            `SELECT hash_url, token, expires_at 
             FROM PwdResetTokens 
             WHERE user_id = ? AND expires_at > NOW()`,
            [id]
        );

        return NextResponse.json({
            ...user[0],
            classes: classes.map((c) => c.class_id),
            hashUrl: tokenData[0]?.hash_url || null,
            token: tokenData[0]?.token || null,
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro ao buscar o usuário." },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('users') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID inválido." },
            { status: 400 }
        );
    }
    
    const { name, email, role, phone_number, classes, hash_url, token, sendEmail = false } = await request.json();
    
    try {
        // Atualizar os dados básicos do usuário
        await pool.query(
            "UPDATE Users SET name = ?, email = ?, role = ?, phone_number = ? WHERE id = ?",
            [name, email, role, phone_number, id]
        );

        // Remover todas as associações atuais entre o usuário e turmas
        await pool.query("DELETE FROM ClassUsers WHERE user_id = ?", [id]);
        if (classes && classes.length > 0) {
            const classValues = classes.map((classId: number) => [classId, id]);
            await pool.query(
                "INSERT INTO ClassUsers (class_id, user_id) VALUES ?",
                [classValues]
            );
        }
        
        // Flag para rastreamento do envio de email
        let emailSent = false;
        
        // Inserir ou atualizar hash_url e token na tabela PwdResetTokens
        if (hash_url && token) {
            await pool.query(
                `INSERT INTO PwdResetTokens (user_id, hash_url, token, expires_at)
                 VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 DAY))
                 ON DUPLICATE KEY UPDATE hash_url = VALUES(hash_url), token = VALUES(token), expires_at = VALUES(expires_at)`,
                [id, hash_url, token]
            );
            
            // Se a opção de enviar email estiver ativada e os dados de email existirem
            if (sendEmail && email && name) {
                try {
                    emailSent = await sendWelcomeEmail(name, email, hash_url, token);
                    if (!emailSent) {
                        console.warn(`Email de redefinição não foi enviado para ${email}.`);
                    }
                } catch (emailError) {
                    console.error("Erro ao enviar email de redefinição:", emailError);
                    // Não interrompemos o fluxo caso o email falhe
                }
            }
        }
        
        return NextResponse.json({ 
            message: "Usuário atualizado com sucesso.",
            emailSent
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Erro ao atualizar o usuário." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    // Get route parameters from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('users') + 1];
    
    if (!id || isNaN(Number(id))) {
        return NextResponse.json(
            { message: "ID inválido." },
            { status: 400 }
        );
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "DELETE FROM Users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Usuário excluído com sucesso." }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Erro ao excluir o usuário." },
            { status: 500 }
        );
    }
}