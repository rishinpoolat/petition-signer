-- Query to get view definition
SELECT pg_get_viewdef('petition_stats'::regclass, true);

-- Alternative detailed query
SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname = 'petition_stats';