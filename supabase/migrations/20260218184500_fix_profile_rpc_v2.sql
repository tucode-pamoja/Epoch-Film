-- Create a new function with a different name to ensure fresh schema registration
CREATE OR REPLACE FUNCTION public.update_director_identity(
    p_nickname TEXT,
    p_introduction TEXT,
    p_profile_image_url TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
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

-- Explicitly grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_director_identity TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_director_identity TO service_role;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
