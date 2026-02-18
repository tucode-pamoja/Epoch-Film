-- RPC to bypass schema cache issues for profile updates
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_nickname TEXT,
    p_introduction TEXT,
    p_profile_image_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Get current user ID (RLS will handle security normally, but for function we use auth.uid())
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    UPDATE public.users
    SET 
        nickname = p_nickname,
        introduction = p_introduction,
        profile_image_url = COALESCE(p_profile_image_url, profile_image_url),
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
