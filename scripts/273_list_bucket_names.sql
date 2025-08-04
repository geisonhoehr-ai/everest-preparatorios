-- Listar nomes dos buckets para verificar se 'redacoes' existe

SELECT 
    name,
    id,
    public,
    created_at
FROM storage.buckets
ORDER BY name; 