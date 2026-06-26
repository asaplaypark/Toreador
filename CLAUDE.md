@AGENTS.md

## Prisma

หลังแก้ไข `prisma/schema.prisma` ทุกครั้ง:
- `npm run dev` จะ `prisma generate` อัตโนมัติก่อน start server
- ถ้าเกิด `Unknown field` error ให้รัน:
  ```
  rm -rf node_modules/.prisma && npx prisma generate && rm -rf .next
  ```
  แล้ว restart dev server
- DDL (`db push`) ต้องใช้ session-mode pooler (port 5432, ไม่มี `pgbouncer=true`) เท่านั้น
