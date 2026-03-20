CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User claims Handler
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer -- Add this line
stable
as $$
declare
    claims jsonb;
    user_role public.app_role;
begin
    -- Initialize claims
    claims := event->'claims';
    
    -- Safely check if user exists and get role
    begin
        select ur.role into user_role 
        from public.user_roles ur 
        join public.users u ON u.role_id = ur.id 
        where u.auth_id = (event->>'user_id')::uuid;
    exception when others then
        -- Log error if needed and set default role
        user_role := null;
    end;

    -- Always return valid jsonb, even if role is null
    claims := jsonb_set(
        claims,
        '{user_role}',
        coalesce(to_jsonb(user_role), 'null'::jsonb)
    );

    return jsonb_set(event, '{claims}', claims);
end;
$$;
grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;


grant execute on function custom_access_token_hook(jsonb) to authenticated;
grant execute on function custom_access_token_hook(jsonb) to service_role;


-- Product Average Rating Management
CREATE OR REPLACE FUNCTION update_product_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE product
    SET avg_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM product_rating
        WHERE product_id = CASE
            WHEN TG_OP = 'DELETE' THEN OLD.product_id
            ELSE NEW.product_id
        END
    )
    WHERE id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.product_id
        ELSE NEW.product_id
    END;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_rating
FOR EACH ROW
EXECUTE FUNCTION update_product_average_rating();


-- Product Filter Function
DROP FUNCTION IF EXISTS get_products_with_filters;

CREATE OR REPLACE FUNCTION get_products_with_filters (
    p_ppe_category TEXT DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'asc',
    p_page_size INT DEFAULT 10,
    p_page INT DEFAULT 1
)
RETURNS TABLE (
    id uuid,
    image VARCHAR,
    "product_ID" VARCHAR,
    ppe_name VARCHAR,
    brand_name VARCHAR,
    price FLOAT,
    ppe_category VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN,
    total_orders BIGINT,
    order_frequency BIGINT,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INT;
    v_total_count BIGINT;
BEGIN
    v_offset := (p_page - 1) * p_page_size;

    WITH filtered_products AS (
        SELECT p.*
        FROM product p
        WHERE p.is_deleted = FALSE
        AND (p_ppe_category IS NULL OR p.ppe_category = p_ppe_category)
        AND (
            p_search_query IS NULL
            OR p.ppe_name ILIKE '%' || p_search_query || '%'
        )
    )
    SELECT COUNT(*)
    INTO v_total_count
    FROM filtered_products;

    RETURN QUERY
    WITH product_orders AS (
        SELECT
            p.*,
            COALESCE(COUNT(oi.id), 0) as order_count,
            COALESCE(COUNT(
                CASE 
                    WHEN oi.created_at >= CURRENT_DATE - INTERVAL '30 days' 
                    THEN oi.id 
                END
            ), 0) as recent_order_count
        FROM product p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        WHERE p.is_deleted = FALSE
        AND (p_ppe_category IS NULL OR p.ppe_category = p_ppe_category)
        AND (
            p_search_query IS NULL
            OR p.ppe_name ILIKE '%' || p_search_query || '%'
        )
        GROUP BY p.id
    )
    SELECT
        po.id,
        po.image,
        po."product_ID",
        po.ppe_name,
        po.brand_name,
        po.price,
        po.ppe_category,
        po.created_at,
        po.is_deleted,
        po.order_count as total_orders,
        po.recent_order_count as order_frequency,
        v_total_count as total_count
    FROM product_orders po
    ORDER BY
        CASE
            WHEN p_sort_by = 'ppe_name' AND p_sort_order = 'asc' THEN po.ppe_name
        END ASC,
        CASE
            WHEN p_sort_by = 'ppe_name' AND p_sort_order = 'desc' THEN po.ppe_name
        END DESC,
        CASE
            WHEN p_sort_by = 'brand_name' AND p_sort_order = 'asc' THEN po.brand_name
        END ASC,
        CASE
            WHEN p_sort_by = 'brand_name' AND p_sort_order = 'desc' THEN po.brand_name
        END DESC,
        CASE
            WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN po.price
        END ASC,
        CASE
            WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN po.price
        END DESC,
        CASE
            WHEN p_sort_by = 'total_orders' AND p_sort_order = 'asc' THEN po.order_count
        END ASC,
        CASE
            WHEN p_sort_by = 'total_orders' AND p_sort_order = 'desc' THEN po.order_count
        END DESC,
        CASE
            WHEN p_sort_by = 'order_frequency' AND p_sort_order = 'asc' THEN po.recent_order_count
        END ASC,
        CASE
            WHEN p_sort_by = 'order_frequency' AND p_sort_order = 'desc' THEN po.recent_order_count
        END DESC,
        CASE
            WHEN p_sort_by = 'created_at' OR p_sort_by IS NULL THEN po.created_at
        END ASC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;


-- EHS Average Rating Management
DROP TRIGGER IF EXISTS update_ehs_toolbox_rating ON ehs_toolbox_users;
DROP FUNCTION IF EXISTS update_ehs_toolbox_average_rating;

CREATE OR REPLACE FUNCTION update_ehs_toolbox_average_rating()
RETURNS TRIGGER
SECURITY DEFINER 
AS $$
BEGIN
    UPDATE ehs_toolbox_talk
    SET avg_rating = (
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
        FROM ehs_toolbox_users
        WHERE toolbox_talk_id = CASE
            WHEN TG_OP = 'DELETE' THEN OLD.toolbox_talk_id
            ELSE NEW.toolbox_talk_id
        END
    )
    WHERE id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.toolbox_talk_id
        ELSE NEW.toolbox_talk_id
    END;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ehs_toolbox_rating
AFTER INSERT OR UPDATE OR DELETE ON ehs_toolbox_users
FOR EACH ROW
EXECUTE FUNCTION update_ehs_toolbox_average_rating();

GRANT ALL PRIVILEGES ON TABLE ehs_toolbox_talk TO service_role;
GRANT ALL PRIVILEGES ON TABLE ehs_toolbox_users TO service_role;
GRANT EXECUTE ON FUNCTION update_ehs_toolbox_average_rating() TO service_role;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;


--Contractor fetch function
DROP FUNCTION IF EXISTS fetch_contractors;

CREATE OR REPLACE FUNCTION fetch_contractors(
    search_query TEXT DEFAULT NULL,
    sort_by TEXT DEFAULT 'first_name',
    sort_order TEXT DEFAULT 'asc',
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    contact_number VARCHAR,
    is_active BOOLEAN,
    total_orders BIGINT,
    total_amount FLOAT,
    total_count BIGINT
) AS $$
DECLARE
    search_first_name TEXT;
    search_last_name TEXT;
    lower_search_query TEXT;
    has_space BOOLEAN;
BEGIN
    IF search_query IS NOT NULL AND trim(search_query) != '' THEN
        lower_search_query := lower(trim(search_query));
        has_space := position(' ' in trim(search_query)) > 0;
        
        IF has_space THEN
            search_first_name := lower(split_part(trim(search_query), ' ', 1));
            search_last_name := lower(split_part(trim(search_query), ' ', 2));
        END IF;
    END IF;

    RETURN QUERY
    WITH contractor_base AS (
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.contact_number,
            u.is_active
        FROM users u
        INNER JOIN user_roles ur ON ur.id = u.role_id 
        WHERE ur.role = 'contractor'
        AND (
            search_query IS NULL
            OR (
                CASE 
                    WHEN has_space THEN
                        (lower(u.first_name) ILIKE '%' || search_first_name || '%' 
                         AND lower(u.last_name) ILIKE '%' || search_last_name || '%')
                    ELSE
                        lower(u.first_name) ILIKE '%' || lower_search_query || '%'
                        OR lower(u.last_name) ILIKE '%' || lower_search_query || '%'
                        OR lower(u.email) ILIKE '%' || lower_search_query || '%'
                        OR lower(u.contact_number) ILIKE '%' || lower_search_query || '%'
                END
            )
        )
    ),
    contractor_stats AS (
        SELECT 
            c.*,
            COUNT(o.id) AS total_orders,
            COALESCE(SUM(o.total_amount), 0) AS total_amount,
            COUNT(*) OVER() AS total_count
        FROM contractor_base c
        LEFT JOIN "order" o ON c.id = o.user_id
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.contact_number, c.is_active
    )
    SELECT 
        cs.id,
        cs.first_name,
        cs.last_name,
        cs.email,
        cs.contact_number,
        cs.is_active,
        cs.total_orders,
        cs.total_amount,
        cs.total_count
    FROM contractor_stats cs
    ORDER BY
        CASE WHEN sort_by = 'first_name' AND sort_order = 'asc' THEN cs.first_name END ASC,
        CASE WHEN sort_by = 'first_name' AND sort_order = 'desc' THEN cs.first_name END DESC,
        CASE WHEN sort_by = 'email' AND sort_order = 'asc' THEN cs.email END ASC,
        CASE WHEN sort_by = 'email' AND sort_order = 'desc' THEN cs.email END DESC,
        CASE WHEN sort_by = 'total_orders' AND sort_order = 'asc' THEN cs.total_orders END ASC,
        CASE WHEN sort_by = 'total_orders' AND sort_order = 'desc' THEN cs.total_orders END DESC,
        CASE WHEN sort_by = 'total_amount' AND sort_order = 'asc' THEN cs.total_amount END ASC,
        CASE WHEN sort_by = 'total_amount' AND sort_order = 'desc' THEN cs.total_amount END DESC
    LIMIT page_size
    OFFSET ((page_number - 1) * page_size);
END;
$$ LANGUAGE plpgsql;

--All contractor fetch function
DROP FUNCTION IF EXISTS fetch_all_contractors;

CREATE OR REPLACE FUNCTION fetch_all_contractors()
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    contact_number VARCHAR,
    company_name VARCHAR,
    total_orders BIGINT,
    total_amount FLOAT,
    total_worksite BIGINT,
    total_workers VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH contractor_base AS (
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.contact_number,
            u.company_name,
            u.total_workers,
            COUNT(w.site_name) AS total_worksite
        FROM users u
        INNER JOIN user_roles ur ON ur.id = u.role_id 
        LEFT JOIN worksite w ON w.user_id = u.id
        WHERE ur.role = 'contractor'
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.contact_number, u.company_name, u.total_workers
    ),
    contractor_stats AS (
        SELECT 
            c.*,
            COUNT(o.id) AS total_orders,
            COALESCE(SUM(o.total_amount), 0) AS total_amount
        FROM contractor_base c
        LEFT JOIN "order" o ON c.id = o.user_id
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.contact_number, c.company_name, c.total_workers, c.total_worksite
    )
    SELECT 
        cs.id,
        cs.first_name,
        cs.last_name,
        cs.email,
        cs.contact_number,
        cs.company_name,
        cs.total_orders,
        cs.total_amount,
        cs.total_worksite,
        cs.total_workers
    FROM contractor_stats cs
    ORDER BY LOWER(cs.first_name || ' ' || cs.last_name) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_updated_at_trigger_for_all_tables() 
RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = table_record.table_name 
              AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('
                DROP TRIGGER IF EXISTS set_updated_at ON %I;
                CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            ', table_record.table_name, table_record.table_name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT create_updated_at_trigger_for_all_tables();