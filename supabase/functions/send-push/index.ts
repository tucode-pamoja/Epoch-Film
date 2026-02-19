import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
    try {
        const { record, table, type } = await req.json();

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        let targetUserId = null;
        let title = "Epoch-Film";
        let body = "";

        if (table === 'bucket_casts') {
            targetUserId = record.user_id;
            title = "🎬 새로운 캐스팅 요청";
            body = "새로운 필름의 공동 감독 혹은 배우로 초대받았습니다.";
        } else if (table === 'quests') {
            // Logic for quest completion notification
        }

        if (!targetUserId) {
            return new Response(JSON.stringify({ message: "No target user" }), { status: 200 });
        }

        // Get push tokens for the user
        const { data: pushTokens, error: tokensError } = await supabaseAdmin
            .from('push_tokens')
            .select('token')
            .eq('user_id', targetUserId);

        if (tokensError || !pushTokens || pushTokens.length === 0) {
            return new Response(JSON.stringify({ message: "No push tokens found" }), { status: 200 });
        }

        const messages = pushTokens.map(t => ({
            to: t.token,
            sound: 'default',
            title,
            body,
            data: { table, recordId: record.id },
        }));

        const response = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messages),
        });

        const result = await response.json();

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
})
